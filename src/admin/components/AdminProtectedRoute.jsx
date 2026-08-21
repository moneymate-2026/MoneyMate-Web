import { Navigate, Outlet, useLocation } from 'react-router-dom';

const AdminProtectedRoute = () => {
  const token = localStorage.getItem('admin_token');
  const merchantToken = localStorage.getItem('merchant_token');
  const location = useLocation();

  if (!token) {
    if (merchantToken) {
      // User is logged in as a merchant, block access to admin area completely
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
          <div className="max-w-md text-center">
            <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
            <h2 className="text-2xl font-semibold mb-2">Area Not Accessible</h2>
            <p className="text-gray-400 mb-6">
              You are currently logged in as a Merchant. The administrative portal is restricted.
            </p>
            <a href="/merchant/dashboard" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors">
              Return to Merchant Dashboard
            </a>
          </div>
        </div>
      );
    }
    // Redirect them to the login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience.
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;
