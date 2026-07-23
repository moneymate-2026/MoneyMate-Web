import { BrowserRouter } from 'react-router-dom';
import './App.css'
import MerchantRouter from './merchant/MerchantRouter'
import AdminRouter from './admin/AdminRouter';

function App() {
  const isAdmin = window.location.pathname.startsWith('/admin');
  
  if (isAdmin) {
    return (
      <BrowserRouter>
        <AdminRouter />
      </BrowserRouter>
    );
  }

  return (
    <MerchantRouter />
  )
}

export default App

