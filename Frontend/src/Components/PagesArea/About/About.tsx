import {
    Bot,
    Cloud,
    Code2,
    Database,
    Layers,
    MapPin,
    Server,
    Sparkles,
    Workflow
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { GithubIcon, LinkedinIcon } from "../../../Utils/BrandIcons";
import "./About.css";

interface SkillCategory {
    title: string;
    icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
    items: string[];
}

const SKILL_CATEGORIES: SkillCategory[] = [
    {
        title: "Frontend",
        icon: Code2,
        items: ["React", "TypeScript", "HTML/CSS", "Vibe Coding"]
    },
    {
        title: "Backend",
        icon: Server,
        items: ["Python (FastAPI/Flask)", "Node.js"]
    },
    {
        title: "AI / GenAI",
        icon: Bot,
        items: ["OpenAI API", "LangChain", "AI Agents", "RAG"]
    },
    {
        title: "Data",
        icon: Database,
        items: ["MySQL", "NoSQL", "Vector DBs"]
    },
    {
        title: "DevOps",
        icon: Cloud,
        items: ["Docker", "AWS", "Git"]
    },
    {
        title: "Automation",
        icon: Workflow,
        items: ["n8n", "Low-Code (Base44)"]
    }
];

// Custom hook: reveals the element with a CSS class once it scrolls into view.
function useInView<T extends HTMLElement>(threshold = 0.15) {
    const ref = useRef<T | null>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setInView(true);
                        observer.disconnect();
                        break;
                    }
                }
            },
            { threshold }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [threshold]);

    return { ref, inView };
}

interface RevealProps {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}

function Reveal({ children, delay = 0, className }: RevealProps) {
    const { ref, inView } = useInView<HTMLDivElement>();
    return (
        <div
            ref={ref}
            className={
                "About-reveal" +
                (inView ? " is-visible" : "") +
                (className ? " " + className : "")
            }
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}

export function About() {
    return (
        <div className="About">
            <div className="About-scroll">
                <div className="About-inner">
                    {/* Hero */}
                    <section className="About-hero">
                        <div className="About-hero-glow" aria-hidden="true" />
                        <Reveal>
                            <span className="About-eyebrow">
                                <Sparkles size={12} strokeWidth={2.2} />
                                About me
                            </span>
                        </Reveal>
                        <Reveal delay={80}>
                            <h1 className="About-hero-title">Daniel Machluf</h1>
                        </Reveal>
                        <Reveal delay={160}>
                            <p className="About-hero-subtitle">
                                Full Stack &amp; GenAI Developer
                            </p>
                        </Reveal>
                        <Reveal delay={240}>
                            <div className="About-hero-meta">
                                <span>21</span>
                                <span className="About-hero-meta-dot" aria-hidden="true" />
                                <span className="About-hero-meta-location">
                                    <MapPin size={13} strokeWidth={2} />
                                    Tel Aviv, Israel
                                    <span aria-hidden="true">🇮🇱</span>
                                </span>
                            </div>
                        </Reveal>
                    </section>

                    {/* About */}
                    <section className="About-section">
                        <Reveal>
                            <span className="About-section-label">About</span>
                        </Reveal>
                        <Reveal delay={80}>
                            <p className="About-bio">
                                I&apos;m a passionate developer currently completing the Full
                                Stack &amp; GenAI Development program at John Bryce (Matrix). I
                                build real AI-powered products end-to-end — from React frontends
                                to Python backends with OpenAI integration, autonomous AI agents,
                                and workflow automations with n8n.
                            </p>
                        </Reveal>
                    </section>

                    {/* Skills */}
                    <section className="About-section">
                        <Reveal>
                            <span className="About-section-label">Skills</span>
                        </Reveal>
                        <Reveal delay={80}>
                            <h2 className="About-section-title">Stack &amp; tooling</h2>
                        </Reveal>

                        <div className="About-skills">
                            {SKILL_CATEGORIES.map((cat, idx) => {
                                const Icon = cat.icon;
                                return (
                                    <Reveal key={cat.title} delay={120 + idx * 60}>
                                        <article className="About-skill-card">
                                            <div className="About-skill-card-head">
                                                <span className="About-skill-icon" aria-hidden="true">
                                                    <Icon size={18} strokeWidth={2} />
                                                </span>
                                                <h3 className="About-skill-title">{cat.title}</h3>
                                            </div>
                                            <ul className="About-skill-list">
                                                {cat.items.map((item) => (
                                                    <li key={item} className="About-skill-item">
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </article>
                                    </Reveal>
                                );
                            })}
                        </div>
                    </section>

                    {/* This Project */}
                    <section className="About-section">
                        <Reveal>
                            <span className="About-section-label">This project</span>
                        </Reveal>
                        <Reveal delay={80}>
                            <article className="About-project">
                                <div className="About-project-head">
                                    <span className="About-project-icon" aria-hidden="true">
                                        <Layers size={18} strokeWidth={2} />
                                    </span>
                                    <h3 className="About-project-title">Morphi</h3>
                                </div>
                                <p className="About-project-text">
                                    A full-stack AI chat platform built as a final course
                                    project. Features: multi-persona AI, model switching,
                                    voice/PDF/image analysis, auto-generated conversation titles,
                                    persistent memory, and real-time analytics via n8n
                                    automations.
                                </p>
                            </article>
                        </Reveal>
                    </section>

                    {/* Contact */}
                    <section className="About-section">
                        <Reveal>
                            <span className="About-section-label">Get in touch</span>
                        </Reveal>
                        <Reveal delay={80}>
                            <div className="About-contact">
                                <a
                                    href="https://github.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="About-contact-btn"
                                >
                                    <GithubIcon size={16} />
                                    <span>GitHub</span>
                                </a>
                                <a
                                    href="https://www.linkedin.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="About-contact-btn"
                                >
                                    <LinkedinIcon size={16} />
                                    <span>LinkedIn</span>
                                </a>
                                <span className="About-contact-chip">
                                    <MapPin size={14} strokeWidth={2} />
                                    Tel Aviv, Israel
                                </span>
                            </div>
                        </Reveal>
                    </section>

                    <footer className="About-footer">
                        <span>© {new Date().getFullYear()} Daniel Machluf — Built with Morphi</span>
                    </footer>
                </div>
            </div>
        </div>
    );
}
