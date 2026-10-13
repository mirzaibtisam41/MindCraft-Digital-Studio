import { ChartCard } from '@/components/charts/ChartCard';
import { formatNumber, formatUptime } from '@/lib/formatNumber';

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 text-[12.5px]">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate text-right font-mono">{children}</dd>
    </div>
  );
}

export function PlatformCard({ platform, totals, className }) {
  return (
    <ChartCard
      title="Platform"
      description="Live API and configuration details."
      className={className}
    >
      <dl className="flex flex-col divide-y">
        <Row label="Database">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-success" aria-hidden />
            {platform.databaseLatencyMs} ms
          </span>
        </Row>
        <Row label="API uptime">{formatUptime(platform.uptimeSeconds)}</Row>
        <Row label="Environment">{platform.environment}</Row>
        <Row label="Image provider">{platform.imageProvider}</Row>
        <Row label="Text model">{platform.textModel}</Row>
        <Row label="Storage bucket">{platform.storageBucket}</Row>
        <Row label="Images stored">{formatNumber(totals.imagesCount)}</Row>
        <Row label="Node">{platform.nodeVersion}</Row>
      </dl>
    </ChartCard>
  );
}
