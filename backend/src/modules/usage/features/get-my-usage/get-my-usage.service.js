import { BadRequestError, NotFoundError } from '#src/utils/index.js';
import { GENERATION_TYPE_CODE } from '#src/modules/generations/generation.constants.js';
import { findCreditWalletByUserIdRepository } from '#src/modules/credit-wallets/shared/repositories/index.js';
import {
  sumUserAnalysisUsageRepository,
  sumUserGenerationUsageRepository,
  sumUserRefundsRepository,
} from '#src/modules/usage/shared/repositories/index.js';

const FEATURE_CODES = [...Object.values(GENERATION_TYPE_CODE), 'vision'];

function checkTimezone(timezone) {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone });
  } catch {
    throw new BadRequestError('Unknown timezone');
  }
}

function readCurrentMonth(timezone) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
  }).format(new Date());
}

function shiftMonth(month, offset) {
  const [year, monthNumber] = month.split('-').map(Number);
  const date = new Date(Date.UTC(year, monthNumber - 1 + offset, 1));

  return date.toISOString().slice(0, 7);
}

function buildRange(month, timezone) {
  return {
    from: `${month}-01`,
    to: `${shiftMonth(month, 1)}-01`,
    timezone,
  };
}

function listMonthDays(month) {
  const [year, monthNumber] = month.split('-').map(Number);
  const dayCount = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();

  return Array.from(
    { length: dayCount },
    (_, index) => `${month}-${String(index + 1).padStart(2, '0')}`,
  );
}

function sumBy(rows, field) {
  return rows.reduce((total, row) => total + row[field], 0);
}

async function readMonthRows({ db, userId, range }) {
  const [generationRows, analysisRows] = await Promise.all([
    sumUserGenerationUsageRepository({ db, userId, range }),
    sumUserAnalysisUsageRepository({ db, userId, range }),
  ]);

  return { generationRows, analysisRows };
}

export async function getMyUsageService({ db, userId, query }) {
  const timezone = query.timezone ?? 'UTC';
  checkTimezone(timezone);

  const month = query.month ?? readCurrentMonth(timezone);
  const range = buildRange(month, timezone);
  const previousRange = buildRange(shiftMonth(month, -1), timezone);

  const [wallet, current, previous, refunds] = await Promise.all([
    findCreditWalletByUserIdRepository({ db, userId }),
    readMonthRows({ db, userId, range }),
    readMonthRows({ db, userId, range: previousRange }),
    sumUserRefundsRepository({ db, userId, range }),
  ]);

  if (!wallet) {
    throw new NotFoundError('User wallet not found');
  }

  const generationCredits = sumBy(current.generationRows, 'credits');
  const imagesGenerated = sumBy(current.generationRows, 'images');

  const features = FEATURE_CODES.map((code) => {
    const rows =
      code === 'vision'
        ? current.analysisRows
        : current.generationRows.filter((row) => row.typeCode === code);

    return { code, credits: sumBy(rows, 'credits'), runs: sumBy(rows, 'runs') };
  });

  const days = listMonthDays(month).map((date) => {
    const generationRows = current.generationRows.filter(
      (row) => row.day === date,
    );
    const analysisRows = current.analysisRows.filter((row) => row.day === date);

    return {
      date,
      credits:
        sumBy(generationRows, 'credits') + sumBy(analysisRows, 'credits'),
      images: sumBy(generationRows, 'images'),
    };
  });

  return {
    month,
    timezone,
    today: new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(
      new Date(),
    ),
    balance: wallet.balance,
    creditsUsed: generationCredits + sumBy(current.analysisRows, 'credits'),
    previousCreditsUsed:
      sumBy(previous.generationRows, 'credits') +
      sumBy(previous.analysisRows, 'credits'),
    imagesGenerated,
    previousImagesGenerated: sumBy(previous.generationRows, 'images'),
    averageCreditsPerImage: imagesGenerated
      ? Math.round((generationCredits / imagesGenerated) * 10) / 10
      : null,
    creditsRefunded: refunds.credits,
    refunds: refunds.refunds,
    features,
    days,
  };
}
