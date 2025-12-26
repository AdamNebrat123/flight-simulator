
export function Crosshair() {
  return (
    <div
    style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 0,
        height: 0,
        pointerEvents: 'none',
        zIndex: 10,
    }}
    >
    {/* top */}
    <div
        style={{
        position: 'absolute',
        background: 'lime',
        width: '2px',
        height: '6px',
        left: '-1px',
        top: '-10px',
        }}
    />
    {/* bottom */}
    <div
        style={{
        position: 'absolute',
        background: 'lime',
        width: '2px',
        height: '6px',
        left: '-1px',
        top: '4px',
        }}
    />
    {/* left */}
    <div
        style={{
        position: 'absolute',
        background: 'lime',
        width: '6px',
        height: '2px',
        left: '-10px',
        top: '-1px',
        }}
    />
    {/* right */}
    <div
        style={{
        position: 'absolute',
        background: 'lime',
        width: '6px',
        height: '2px',
        left: '4px',
        top: '-1px',
        }}
    />
    </div>
  );
}