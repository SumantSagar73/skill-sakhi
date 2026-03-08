import Navbar from './Navbar';
import Footer from './Footer';
import PreferencesModal from '../ui/PreferencesModal';

const Layout = ({ children }) => (
    <div className="app-layout">
        <Navbar />
        <PreferencesModal />
        <main className="main-content">{children}</main>
        <Footer />
    </div>
);

export default Layout;
