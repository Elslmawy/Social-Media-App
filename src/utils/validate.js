const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#_\-^]).{8,}$/;

export function validateField(name, form, isLogin = false) {
  const value = typeof form[name] === 'string' ? form[name].trim() : form[name];

  if (isLogin) {
    if (name === 'email') {
      if (!value) return 'Email is required';
      if (!EMAIL_REGEX.test(value)) return 'Enter a valid email like name@example.com';
    }
    if (name === 'password') {
      if (!form.password) return 'Password is required';
    }
    return '';
  }

  switch (name) {
    case 'name':
      if (!value) return 'Full name is required';
      if (value.length < 3) return 'Full name must be at least 3 characters';
      return '';

    case 'username': {
      if (!value) return 'Username is required';
      const cleanUsername = value.replace(/^@/, '');
      if (!cleanUsername) return 'Username is required';
      if (!USERNAME_REGEX.test(cleanUsername)) {
        return 'Username must be 3-20 characters: letters, numbers, or underscore only';
      }
      return '';
    }

    case 'email':
      if (!value) return 'Email is required';
      if (!EMAIL_REGEX.test(value)) return 'Enter a valid email like name@example.com';
      return '';

    case 'password':
      if (!form.password) return 'Password is required';
      if (!PASSWORD_REGEX.test(form.password)) {
        return 'At least 8 characters with uppercase, lowercase, number, and special character';
      }
      return '';

    case 'rePassword':
      if (!form.rePassword) return 'Please confirm your password';
      if (form.rePassword !== form.password) return 'Passwords do not match';
      return '';

    case 'dateOfBirth': {
      if (!form.dateOfBirth) return 'Date of birth is required';
      const selectedDate = new Date(form.dateOfBirth);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (isNaN(selectedDate.getTime())) return 'Please enter a valid date';
      if (selectedDate > today) return "Date of birth can't be in the future";
      return '';
    }

    case 'gender':
      if (!form.gender) return 'Gender is required';
      return '';

    default:
      return '';
  }
}

export function validateSignup(form) {
  const errors = {};
  const fields = ['name', 'username', 'email', 'password', 'rePassword', 'dateOfBirth', 'gender'];

  for (const field of fields) {
    const error = validateField(field, form, false);
    if (error) {
      errors[field] = error;
    }
  }

  return errors;
}

export function validateLogin(form) {
  const errors = {};
  const fields = ['email', 'password'];

  for (const field of fields) {
    const error = validateField(field, form, true);
    if (error) {
      errors[field] = error;
    }
  }

  return errors;
}

export function validateChangePassword(form) {
  const errors = {};
  if (!form.password) {
    errors.password = 'Current password is required';
  }
  if (!form.newPassword) {
    errors.newPassword = 'New password is required';
  } else if (!PASSWORD_REGEX.test(form.newPassword)) {
    errors.newPassword =
      'At least 8 characters with uppercase, lowercase, number, and special character';
  }
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Confirm new password is required';
  } else if (form.confirmPassword !== form.newPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  return errors;
}
