-- Trigger for new user creation (inserts into profiles)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for new reservation (sends webhook notification)
DROP TRIGGER IF EXISTS on_new_reservation ON public.reservas;
CREATE TRIGGER on_new_reservation
  AFTER INSERT ON public.reservas
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_reservation();