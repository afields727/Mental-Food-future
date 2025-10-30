import Link from 'next/link';
import Navigation from '../src/components/Navigation';

const QUOTES = [
    {
        text: "The greatest wealth is health.",
        author: "Virgil"
    },
    {
        text: "A fit body, a calm mind, a house full of love. These things cannot be bought – they must be earned.",
        author: "Naval Ravikant"
    },
    {
        text: "To keep the body in good health is a duty... otherwise we shall not be able to keep our mind strong and clear.",
        author: "Buddha"
    },
    {
        text: "The food you eat can be either the safest and most powerful form of medicine or the slowest form of poison.",
        author: "Ann Wigmore"
    },
    {
        text: "It is health that is real wealth and not pieces of gold and silver.",
        author: "Mahatma Gandhi"
    }
];

export default function QuotesPage() {
    return (
        <div className="container">
            <div className="container" style={{
                backgroundColor: '#f0f4f0',
                color: '#333',
                padding: '1rem',
                minHeight: '100vh'
            }}>
                <Navigation />
            <header style={{ textAlign: 'center', marginBottom: 18 }}>
                <h1>Inspirational Quotes</h1>
                <p className="note">A little motivation for your mental and physical wellbeing.</p>
            </header>
            <main>
                {QUOTES.map((quote, index) => (
                    <div key={index} className="card" style={{marginBottom: '1rem'}}>
                        <blockquote style={{margin: 0, padding: '1rem'}}>
                            <p>"{quote.text}"</p>
                            <footer style={{textAlign: 'right', fontStyle: 'italic'}}>— {quote.author}</footer>
                        </blockquote>
                    </div>
                ))}
            </main>
            </div>
        </div>
    );
}