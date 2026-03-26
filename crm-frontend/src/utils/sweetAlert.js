import Swal from 'sweetalert2';

export const showSuccessAlert = (title, text = '') => {
  return Swal.fire({
    icon: 'success',
    title: title,
    text: text,
    timer: 3000,
    showConfirmButton: false,
    toast: true,
    position: 'top-end'
  });
};

export const showErrorAlert = (title, text = '') => {
  return Swal.fire({
    icon: 'error',
    title: title,
    text: text,
    confirmButtonColor: '#d33'
  });
};

export const showWarningAlert = (title, text = '', confirmText = 'Yes') => {
  return Swal.fire({
    icon: 'warning',
    title: title,
    text: text,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: confirmText,
    showCancelButton: true
  });
};

export const showConfirmAlert = (title, text = '', confirmText = 'Yes', cancelText = 'No') => {
  return Swal.fire({
    icon: 'question',
    title: title,
    text: text,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    showCancelButton: true
  });
};

export const showInfoAlert = (title, text = '') => {
  return Swal.fire({
    icon: 'info',
    title: title,
    text: text,
    confirmButtonColor: '#3085d6'
  });
};

export const showToast = (title, icon = 'success', position = 'top-end') => {
  return Swal.fire({
    icon: icon,
    title: title,
    toast: true,
    position: position,
    timer: 3000,
    showConfirmButton: false
  });
};
