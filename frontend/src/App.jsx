import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import TicketList from './pages/TicketList';
import TicketDetail from './pages/TicketDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<TicketList />} />
          <Route path="tickets/:id" element={<TicketDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
