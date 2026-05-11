import { Header } from "../Header/Header";
import { Routing } from "../Routing/Routing";
import "./Layout.css";

export function Layout() {
    return (
        <div className="Layout">
            <header className="Layout-header">
                <Header />
            </header>

            <main className="Layout-main">
                <Routing />
            </main>
        </div>
    );
}
