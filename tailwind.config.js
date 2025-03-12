module.exports = {
    theme: {
      extend: {
        keyframes: {
          'badge-pop': {
            '0%': { transform: 'scale(0.8)', opacity: '0' },
            '50%': { transform: 'scale(1.05)', opacity: '1' },
            '100%': { transform: 'scale(1)', opacity: '1' },
          },
        },
        animation: {
          'badge-pop': 'badge-pop 0.4s ease-out',
        },
      },
    },
  }