'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Search, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/FormAlert';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGetUsersQuery } from '@/features/users/usersApi';
import {
  USER_ROLES,
  USER_STATUSES,
  findUserRole,
  findUserStatus,
} from '@/features/users/userOptions';
import { getErrorMessage } from '@/lib/apiError';

const PAGE_SIZE = 20;
const ALL = 'all';

function formatDate(value) {
  if (!value) return 'Never';

  return new Date(value).toLocaleDateString(undefined, { dateStyle: 'medium' });
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 sm:w-40" aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{label}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function EmptyState({ hasFilters }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
      <span className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Users className="size-5" />
      </span>
      <p className="font-medium">
        {hasFilters ? 'No users match these filters' : 'No users yet'}
      </p>
    </div>
  );
}

export function UsersView() {
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');
  const [role, setRole] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchText.trim());
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText]);

  const { data, isLoading, isFetching, error } = useGetUsersQuery({
    page,
    limit: PAGE_SIZE,
    ...(search ? { search } : {}),
    ...(role !== ALL ? { role } : {}),
    ...(status !== ALL ? { status } : {}),
  });

  const users = data?.users ?? [];
  const meta = data?.meta;
  const hasFilters = Boolean(search) || role !== ALL || status !== ALL;
  const firstRow =
    meta && meta.total > 0 ? (meta.page - 1) * meta.limit + 1 : 0;
  const lastRow = meta ? Math.min(meta.page * meta.limit, meta.total) : 0;

  function changeFilter(setter) {
    return (value) => {
      setter(value);
      setPage(1);
    };
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-[22px] font-semibold tracking-tight">Users</h1>
        <p className="text-muted-foreground">
          Everyone who has an account, with their role, status and credits.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-3" />
          <Input
            placeholder="Search name or email"
            className="h-9 pl-9"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            aria-label="Search users"
          />
        </div>
        <FilterSelect
          label="All roles"
          value={role}
          onChange={changeFilter(setRole)}
          options={USER_ROLES}
        />
        <FilterSelect
          label="All statuses"
          value={status}
          onChange={changeFilter(setStatus)}
          options={USER_STATUSES}
        />
      </div>

      {error ? <FormAlert>{getErrorMessage(error)}</FormAlert> : null}

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((row) => (
            <Skeleton key={row} className="h-12 w-full" />
          ))}
        </div>
      ) : null}

      {!isLoading && !error && users.length === 0 ? (
        <EmptyState hasFilters={hasFilters} />
      ) : null}

      {users.length > 0 ? (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Credits</TableHead>
                <TableHead className="hidden md:table-cell">Joined</TableHead>
                <TableHead className="hidden lg:table-cell">
                  Last login
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const userRole = findUserRole(user.role);
                const userStatus = findUserStatus(user.status);

                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="font-medium hover:text-brand hover:underline"
                      >
                        {user.name}
                      </Link>
                      <p className="text-xs text-ink-3">{user.email}</p>
                    </TableCell>
                    <TableCell>
                      <Badge tone={userRole.tone}>{userRole.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge tone={userStatus.tone}>{userStatus.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {(user.balance ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">
                      {formatDate(user.lastLoginAt)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : null}

      {meta && meta.total > 0 ? (
        <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>
            {firstRow}–{lastRow} of {meta.total}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft />
              Previous
            </Button>
            <span>
              Page {meta.page} of {meta.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.totalPages || isFetching}
              onClick={() => setPage(page + 1)}
            >
              Next
              <ChevronRight />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
