import { Menu } from "../Menu/Menu";
import "./Header.css";
import CubeMorphiNew from "../../../assets/Screenshots/CubeMorphiNew.png";

export function Header() {
    return (
        <div className="Header">
            <div className="Header-inner">
                <div className="Header-brand">
                    <img src={CubeMorphiNew} alt="Morphi" className="Header-logo-img" />
                </div>

                <Menu />
            </div>
        </div>
    );
}
