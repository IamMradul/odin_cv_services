import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './layout.css';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  return (
    <div className="app-layout">
      <Sidebar isOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen(p => !p)} />
      <div className="main-wrapper">
        <Header isSidebarOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen(p => !p)} />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
