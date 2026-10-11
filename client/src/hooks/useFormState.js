'use client';

import { useState } from 'react';

export function useFormState(initialValues) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;

    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setFormError('');
  }

  function reset() {
    setValues(initialValues);
    setErrors({});
    setFormError('');
  }

  return {
    values,
    errors,
    formError,
    setErrors,
    setFormError,
    handleChange,
    reset,
  };
}
