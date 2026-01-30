alter table "public"."clients" add column "user_id" uuid not null default auth.uid();

alter table "public"."clients" enable row level security;

alter table "public"."projects" add column "user_id" uuid not null default auth.uid();

alter table "public"."projects" enable row level security;

alter table "public"."tasks" add column "user_id" uuid not null default auth.uid();

alter table "public"."tasks" enable row level security;

alter table "public"."time_entries" add column "user_id" uuid not null default auth.uid();

alter table "public"."time_entries" enable row level security;

CREATE INDEX idx_clients_user_id ON public.clients USING btree (user_id);

CREATE INDEX idx_projects_user_id ON public.projects USING btree (user_id);

CREATE INDEX idx_tasks_user_id ON public.tasks USING btree (user_id);

CREATE INDEX idx_time_entries_user_id ON public.time_entries USING btree (user_id);

alter table "public"."clients" add constraint "clients_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."clients" validate constraint "clients_user_id_fkey";

alter table "public"."projects" add constraint "projects_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."projects" validate constraint "projects_user_id_fkey";

alter table "public"."tasks" add constraint "tasks_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."tasks" validate constraint "tasks_user_id_fkey";

alter table "public"."time_entries" add constraint "time_entries_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."time_entries" validate constraint "time_entries_user_id_fkey";


  create policy "Users can delete own clients"
  on "public"."clients"
  as permissive
  for delete
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "Users can delete their own clients"
  on "public"."clients"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));



  create policy "Users can insert own clients"
  on "public"."clients"
  as permissive
  for insert
  to authenticated
with check ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "Users can insert their own clients"
  on "public"."clients"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can update own clients"
  on "public"."clients"
  as permissive
  for update
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)))
with check ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "Users can update their own clients"
  on "public"."clients"
  as permissive
  for update
  to public
using ((auth.uid() = user_id));



  create policy "Users can view own clients"
  on "public"."clients"
  as permissive
  for select
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "Users can view their own clients"
  on "public"."clients"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Users can delete own projects"
  on "public"."projects"
  as permissive
  for delete
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "Users can delete projects of their clients"
  on "public"."projects"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM public.clients
  WHERE ((clients.id = projects.client_id) AND (clients.user_id = auth.uid())))));



  create policy "Users can insert own projects"
  on "public"."projects"
  as permissive
  for insert
  to authenticated
with check (((user_id = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM public.clients
  WHERE ((clients.id = projects.client_id) AND (clients.user_id = ( SELECT auth.uid() AS uid)))))));



  create policy "Users can insert projects for their clients"
  on "public"."projects"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.clients
  WHERE ((clients.id = projects.client_id) AND (clients.user_id = auth.uid())))));



  create policy "Users can update own projects"
  on "public"."projects"
  as permissive
  for update
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)))
with check (((user_id = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM public.clients
  WHERE ((clients.id = projects.client_id) AND (clients.user_id = ( SELECT auth.uid() AS uid)))))));



  create policy "Users can update projects of their clients"
  on "public"."projects"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM public.clients
  WHERE ((clients.id = projects.client_id) AND (clients.user_id = auth.uid())))));



  create policy "Users can view own projects"
  on "public"."projects"
  as permissive
  for select
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "Users can view projects of their clients"
  on "public"."projects"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.clients
  WHERE ((clients.id = projects.client_id) AND (clients.user_id = auth.uid())))));



  create policy "Users can delete own tasks"
  on "public"."tasks"
  as permissive
  for delete
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "Users can delete tasks of their projects"
  on "public"."tasks"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM (public.projects
     JOIN public.clients ON ((clients.id = projects.client_id)))
  WHERE ((projects.id = tasks.project_id) AND (clients.user_id = auth.uid())))));



  create policy "Users can insert own tasks"
  on "public"."tasks"
  as permissive
  for insert
  to authenticated
with check (((user_id = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM public.projects
  WHERE ((projects.id = tasks.project_id) AND (projects.user_id = ( SELECT auth.uid() AS uid)))))));



  create policy "Users can insert tasks for their projects"
  on "public"."tasks"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM (public.projects
     JOIN public.clients ON ((clients.id = projects.client_id)))
  WHERE ((projects.id = tasks.project_id) AND (clients.user_id = auth.uid())))));



  create policy "Users can update own tasks"
  on "public"."tasks"
  as permissive
  for update
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)))
with check (((user_id = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM public.projects
  WHERE ((projects.id = tasks.project_id) AND (projects.user_id = ( SELECT auth.uid() AS uid)))))));



  create policy "Users can update tasks of their projects"
  on "public"."tasks"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM (public.projects
     JOIN public.clients ON ((clients.id = projects.client_id)))
  WHERE ((projects.id = tasks.project_id) AND (clients.user_id = auth.uid())))));



  create policy "Users can view own tasks"
  on "public"."tasks"
  as permissive
  for select
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "Users can view tasks of their projects"
  on "public"."tasks"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM (public.projects
     JOIN public.clients ON ((clients.id = projects.client_id)))
  WHERE ((projects.id = tasks.project_id) AND (clients.user_id = auth.uid())))));



  create policy "Users can delete own time entries"
  on "public"."time_entries"
  as permissive
  for delete
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "Users can delete their own time entries"
  on "public"."time_entries"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM public.clients
  WHERE ((clients.id = time_entries.client_id) AND (clients.user_id = auth.uid())))));



  create policy "Users can insert own time entries"
  on "public"."time_entries"
  as permissive
  for insert
  to authenticated
with check (((user_id = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM public.clients
  WHERE ((clients.id = time_entries.client_id) AND (clients.user_id = ( SELECT auth.uid() AS uid))))) AND ((project_id IS NULL) OR (EXISTS ( SELECT 1
   FROM public.projects
  WHERE ((projects.id = time_entries.project_id) AND (projects.user_id = ( SELECT auth.uid() AS uid)))))) AND ((task_id IS NULL) OR (EXISTS ( SELECT 1
   FROM public.tasks
  WHERE ((tasks.id = time_entries.task_id) AND (tasks.user_id = ( SELECT auth.uid() AS uid))))))));



  create policy "Users can insert their own time entries"
  on "public"."time_entries"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.clients
  WHERE ((clients.id = time_entries.client_id) AND (clients.user_id = auth.uid())))));



  create policy "Users can update own time entries"
  on "public"."time_entries"
  as permissive
  for update
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)))
with check (((user_id = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM public.clients
  WHERE ((clients.id = time_entries.client_id) AND (clients.user_id = ( SELECT auth.uid() AS uid))))) AND ((project_id IS NULL) OR (EXISTS ( SELECT 1
   FROM public.projects
  WHERE ((projects.id = time_entries.project_id) AND (projects.user_id = ( SELECT auth.uid() AS uid)))))) AND ((task_id IS NULL) OR (EXISTS ( SELECT 1
   FROM public.tasks
  WHERE ((tasks.id = time_entries.task_id) AND (tasks.user_id = ( SELECT auth.uid() AS uid))))))));



  create policy "Users can update their own time entries"
  on "public"."time_entries"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM public.clients
  WHERE ((clients.id = time_entries.client_id) AND (clients.user_id = auth.uid())))));



  create policy "Users can view own time entries"
  on "public"."time_entries"
  as permissive
  for select
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "Users can view their own time entries"
  on "public"."time_entries"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.clients
  WHERE ((clients.id = time_entries.client_id) AND (clients.user_id = auth.uid())))));



