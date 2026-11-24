-- 003_storage.sql
-- Хранилище файлов: обложки новостей и документы кафедры.

insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do nothing;

-- Чтение файлов разрешено всем: документы кафедры публичны.
create policy "covers: публичное чтение"
  on storage.objects for select
  using (bucket_id = 'covers');

create policy "documents: публичное чтение"
  on storage.objects for select
  using (bucket_id = 'documents');

-- Загружать и заменять файлы могут только сотрудники.
create policy "covers: загрузка сотрудниками"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'covers' and public.is_staff());

create policy "covers: замена сотрудниками"
  on storage.objects for update to authenticated
  using (bucket_id = 'covers' and public.is_staff());

create policy "covers: удаление сотрудниками"
  on storage.objects for delete to authenticated
  using (bucket_id = 'covers' and public.is_staff());

create policy "documents: загрузка сотрудниками"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'documents' and public.is_staff());

create policy "documents: замена сотрудниками"
  on storage.objects for update to authenticated
  using (bucket_id = 'documents' and public.is_staff());

create policy "documents: удаление сотрудниками"
  on storage.objects for delete to authenticated
  using (bucket_id = 'documents' and public.is_staff());
