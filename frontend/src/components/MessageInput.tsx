import { useState } from 'react';
interface Props {
    onSend: (text: string) => void;
    disabled: boolean;
}
export const MessageInput = ({ onSend, disabled }: Props) => {
    const [text, setText] = useState('');
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim() && !disabled) {
            onSend(text);
            setText('');
        }
    };
    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            {text.length >= 500 && (
                <div style={{ padding: '0 20px', color: '#dc2626', fontSize: '0.8rem', marginTop: '10px' }}>
                    ⚠️ Maximum message length reached(500 characters).
                </div>
            )}
            <form className="input-area" onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type a message..."
                    disabled={disabled}
                    maxLength={500}
                />
                <button type="submit" disabled={disabled || !text.trim()}>
                    Send
                </button>
            </form>
        </div>
    );
};