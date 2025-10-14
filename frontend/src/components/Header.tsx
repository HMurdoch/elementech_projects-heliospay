import dayjs from 'dayjs'

export default function Header() {
    return (
        <div className="panel" style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
                <div className="h1">HeliosPay • Demo</div>
                <div className="muted small">Integration POC · {dayjs().format('YYYY')}</div>
            </div>
            <a className="small" href={`${import.meta.env.VITE_API_URL}/swagger`} target="_blank" rel="noreferrer">
                Open Swagger ↗
            </a>
        </div>
    )
}