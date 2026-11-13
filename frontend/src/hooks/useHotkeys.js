import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useHotkeys = (handlers = {}) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Do not intercept if typing in standard text inputs unless it's a dedicated function key (F1-F12)
      const isFunctionKey = /^F\d{1,2}$/.test(e.key) || e.key === 'Insert';
      const targetTag = e.target.tagName?.toLowerCase();
      const isInput = targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select';

      if (isFunctionKey) {
        e.preventDefault();
      }

      switch (e.key) {
        case 'F1':
          if (handlers.onF1) handlers.onF1();
          else navigate('/');
          break;
        case 'F2':
          if (handlers.onF2) handlers.onF2();
          else navigate('/billing');
          break;
        case 'F3':
          if (handlers.onF3) handlers.onF3();
          else navigate('/products');
          break;
        case 'F4':
          if (handlers.onF4) handlers.onF4();
          else navigate('/sales');
          break;
        case 'F5':
          if (handlers.onF5) handlers.onF5();
          else navigate('/stock-logs');
          break;
        case 'F6':
          if (handlers.onF6) handlers.onF6();
          break;
        case 'F7':
          if (handlers.onF7) handlers.onF7();
          break;
        case 'F8':
          if (handlers.onF8) handlers.onF8();
          break;
        case 'F10':
          if (handlers.onF10) handlers.onF10();
          break;
        case 'Insert':
          if (handlers.onInsert) handlers.onInsert();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, handlers]);
};

export default useHotkeys;

