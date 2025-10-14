export default function Spinner({ size = 18 }: { size?: number }) {
    const s = { width: size, height: size, border: '2px solid #2b3246', borderTop: `2px solid var(--brand)`, borderRadius: '50%', animation: 'spin .9s linear infinite' };
    return <span style={s} aria-hidden />
}