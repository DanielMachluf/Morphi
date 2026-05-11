import { Navigate, Route, Routes } from "react-router-dom";
import { About } from "../../PagesArea/About/About";
import { Chat } from "../../PagesArea/Chat/Chat";
import { Page404 } from "../../PagesArea/Page404/Page404";

export function Routing() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/chat" replace />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Page404 />} />
        </Routes>
    );
}
