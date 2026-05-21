import { Route, Routes } from 'react-router-dom';
import AppLayout from './layout/AppLayout';
import { App as AntApp, ConfigProvider } from 'antd';
import IncomeAndExpense from "./pages/income-and-expense/IncomeAndExpense"
import Container from './pages/container/Container';
import Party from './pages/party/Party';
import SaleInvoice from './pages/sale-invoice/SaleInvoice';
import dayjs from 'dayjs';
import thTh from 'antd/locale/th_TH'
import PurchaseInvoice from './pages/purchase-invoice/PurchaseInvoice';
import TruckInvoice from './pages/truck-invoice/TruckInvoice';
import StartupProvider from './startup/StartupProvider';
import PartyDetail from './pages/party/PartyDetail';

dayjs.locale('th')
const App = () => {
  return (
    <AntApp>
      <StartupProvider />
      <ConfigProvider locale={thTh}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<div>Page</div>} />
            <Route path="/home" element={<div>Page</div>} />
            <Route path="/income-and-expenses" element={<IncomeAndExpense />} />
            <Route path="/sales-invoices" element={<SaleInvoice />} />
            <Route path="/purchase-invoices" element={<PurchaseInvoice />} />
            <Route path="/truck-invoices" element={<TruckInvoice />} />
            <Route path="/containers" element={<Container />} />
            <Route path="/parties" element={<Party />} />
            <Route path="/parties/:id" element={<PartyDetail />} />
            <Route path="/settings" element={<div>Page</div>} />
          </Route>
        </Routes>
      </ConfigProvider>
    </AntApp>
  )
}

export default App
