import { Route, Routes } from 'react-router-dom';
import AppSidebar from './components/Sidebar';
import { ConfigProvider } from 'antd';

const App = () => {
  return (
    <ConfigProvider>
      <Routes>
        <Route element={<AppSidebar />}>
          <Route path="/" element={<div>Page</div>} />
          <Route path="/income-and-expense" element={<div>Page</div>} />
          <Route path="/purchase-invoices" element={<div>Page</div>} />
          <Route path="/sales-invoices" element={<div>Page</div>} />
          <Route path="/truck-invoices" element={<div>Page</div>} />
          <Route path="crates" element={<div>Page</div>} />
          <Route path="/parties" element={<div>Page</div>} />
          <Route path="/settings" element={<div>Page</div>} />
        </Route>
      </Routes>
    </ConfigProvider>
  )
}

export default App
