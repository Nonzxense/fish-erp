import { Route, Routes } from 'react-router-dom';
import AppLayout from './layout/AppLayout';
import { App as AntApp, ConfigProvider } from 'antd';
import IncomeAndExpense from "./pages/income-and-expense/IncomeAndExpense"
import Container from './pages/container/Container';
import Party from './pages/party/Party';
import SaleInvoice from './pages/sale-invoice/SaleInvoice';

const App = () => {
  return (
    <AntApp>
      <ConfigProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<div>Page</div>} />
            <Route path="/home" element={<div>Page</div>} />
            <Route path="/income-and-expenses" element={<IncomeAndExpense />} />
            <Route path="/sales-invoices" element={<SaleInvoice />} />
            <Route path="/purchase-invoices" element={<div>Page</div>} />
            <Route path="/truck-invoices" element={<div>Page</div>} />
            <Route path="/containers" element={<Container />} />
            <Route path="/parties" element={<Party />} />
            <Route path="/settings" element={<div>Page</div>} />
          </Route>
        </Routes>
      </ConfigProvider>
    </AntApp>
  )
}

export default App
