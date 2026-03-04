import { Route, Routes } from 'react-router-dom';
import AppLayout from './layout/AppLayout';
import { ConfigProvider } from 'antd';
import IncomeAndExpense from "./pages/income-and-expense/IncomeAndExpense"

const App = () => {
  return (
    <ConfigProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<div>Page</div>} />
          <Route path="/home" element={<div>Page</div>} />
          <Route path="/income-and-expenses" element={<IncomeAndExpense />} />
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
