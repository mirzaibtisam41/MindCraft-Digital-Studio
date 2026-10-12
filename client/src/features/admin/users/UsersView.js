'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import {
  EmptyState,
  ErrorState,
  TableSkeleton,
} from '@/components/ui/DataState';
import { FilterSelect } from '@/components/ui/FilterSelect';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  PAGE_SIZE,
  USER_ROLE_OPTIONS,
  USER_STATUS_OPTIONS,
} from '@/constants/admin';
import { useGetAdminUsersQuery } from '@/features/admin/adminApi';
import { RoleBadge, StatusBadge } from '@/features/admin/users/UserBadges';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { formatDate } from '@/lib/formatDate';

export function UsersView() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim());

  const { data, isFetching, isLoading, error, refetch } = useGetAdminUsersQuery(
    {
      page,
      pageSize: PAGE_SIZE,
      search: debouncedSearch,
      role,
      status,
    },
  );

  function changeFilter(setter) {
    return (value) => {
      setter(value);
      setPage(1);
    };
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Users"
        description="Search accounts, suspend access, change roles and adjust credits."
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-3"
            aria-hidden="true"
          />
          <Input
            type="search"
            aria-label="Search users"
            placeholder="Search by name or email"
            className="h-10 pl-9"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </div>
        <FilterSelect
          label="Filter by role"
          allLabel="All roles"
          value={role}
          options={USER_ROLE_OPTIONS}
          onChange={changeFilter(setRole)}
          className="w-40"
        />
        <FilterSelect
          label="Filter by status"
          allLabel="All statuses"
          value={status}
          options={USER_STATUS_OPTIONS}
          onChange={changeFilter(setStatus)}
          className="w-40"
        />
      </div>

      <div className="rounded-xl border bg-card" aria-busy={isFetching}>
        {isLoading ? <TableSkeleton /> : null}
        {error ? <ErrorState error={error} onRetry={refetch} /> : null}
        {data && data.items.length === 0 ? (
          <EmptyState
            title="No users found"
            description="Try a different search or clear the filters."
          />
        ) : null}
        {data && data.items.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Credits</TableHead>
                  <TableHead className="text-right">Generations</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="flex flex-col outline-none hover:underline focus-visible:underline"
                      >
                        <span className="font-medium">{user.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <RoleBadge role={user.role} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge suspendedAt={user.suspendedAt} />
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {user.creditBalance}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {user.generationsCount}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination meta={data.meta} onPageChange={setPage} />
          </>
        ) : null}
      </div>
    </div>
  );
}
