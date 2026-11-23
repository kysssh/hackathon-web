'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useAction } from '@/components/private/hooks/use-action';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updateProfileAction } from '@/lib/profile/actions';
import {
  PROFILE_LIMITS,
  UNIVERSITY_SUGGESTIONS,
  isValidPersonName,
  normalizeProfileText,
} from '@/lib/profile/rules';

type Values = { firstName: string; lastName: string; university: string };
type Errors = Partial<Record<keyof Values, string>>;

/** Aviso local antes de ir al servidor (que igual vuelve a validar). */
function validate(values: Values): Errors {
  const errors: Errors = {};
  const firstName = normalizeProfileText(values.firstName);
  const lastName = normalizeProfileText(values.lastName);
  const university = normalizeProfileText(values.university);

  if (firstName.length < PROFILE_LIMITS.nameMin) errors.firstName = 'Escribe tus nombres.';
  else if (!isValidPersonName(firstName)) errors.firstName = 'Usa solo letras en tus nombres.';

  if (lastName.length < PROFILE_LIMITS.nameMin) errors.lastName = 'Escribe tus apellidos.';
  else if (!isValidPersonName(lastName)) errors.lastName = 'Usa solo letras en tus apellidos.';

  if (university.length < PROFILE_LIMITS.universityMin) errors.university = 'Indica tu universidad.';
  return errors;
}

export function ProfileForm({
  initial,
  isEditing,
}: {
  initial: Values;
  isEditing: boolean;
}) {
  const router = useRouter();
  const { run, pending, error, fieldErrors } = useAction(updateProfileAction);
  const [values, setValues] = useState<Values>(initial);
  const [errors, setErrors] = useState<Errors>({});

  const set = (field: keyof Values) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [field]: e.target.value }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const local = validate(values);
    setErrors(local);
    if (Object.keys(local).length > 0) return;
    run(values, () => {
      router.push('/panel');
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-busy={pending}
      className="mt-8 space-y-5"
      data-testid="profile-form"
    >
      <Input
        id="profile-first-name"
        label="Nombres"
        autoComplete="given-name"
        data-testid="profile-first-name"
        value={values.firstName}
        onChange={set('firstName')}
        maxLength={PROFILE_LIMITS.nameMax}
        required
        error={errors.firstName ?? fieldErrors.firstName?.[0]}
      />
      <Input
        id="profile-last-name"
        label="Apellidos"
        autoComplete="family-name"
        data-testid="profile-last-name"
        value={values.lastName}
        onChange={set('lastName')}
        maxLength={PROFILE_LIMITS.nameMax}
        required
        error={errors.lastName ?? fieldErrors.lastName?.[0]}
      />
      <Input
        id="profile-university"
        label="Universidad"
        autoComplete="organization"
        list="university-suggestions"
        placeholder="Escribe o elige de la lista"
        data-testid="profile-university"
        value={values.university}
        onChange={set('university')}
        maxLength={PROFILE_LIMITS.universityMax}
        required
        hint="Si tu universidad no aparece en la lista, escríbela completa."
        error={errors.university ?? fieldErrors.university?.[0]}
      />
      <datalist id="university-suggestions">
        {UNIVERSITY_SUGGESTIONS.map((u) => (
          <option key={u} value={u} />
        ))}
      </datalist>

      <Button
        type="submit"
        data-testid="profile-submit"
        loading={pending}
        className="w-full"
      >
        {pending ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Continuar'}
      </Button>

      {error && (
        <p role="alert" data-testid="profile-error" className="text-sm text-red-300">
          {error}
        </p>
      )}
    </form>
  );
}
