-- event_state representa el estado global del hackathon y solo puede tener una fila.
ALTER TABLE "event_state"
ADD CONSTRAINT "event_state_singleton_check" CHECK ("id" = 1);
