// One part in a build's list, laid out like a line on a spec sheet: category, part, price. Plain
// markup with no state, so both the server-rendered page and the owner's editor
// (components/ModEditor.js) use it. `action` is an optional control shown beside the part, such as
// the owner's Remove button.
export default function ModItem({ mod, full = true, addedLabel = 'Added by the owner', action = null }) {
    const cost = Number.isFinite(mod.cost_usd) ? `$${mod.cost_usd.toLocaleString('en-US')}` : null;

    return (
        <li className={action ? 'mod mod--has-action' : 'mod'}>
            <div className="mod__head">
                <span className="pill mod__cat">{mod.category}</span>
                <span className="mod__part">
                    {mod.part}
                    {mod.source === 'you' && <span className="pill pill--accent mod__added">{addedLabel}</span>}
                </span>
                {cost && <span className="mod__cost">{cost}</span>}
            </div>
            {action}
            {full && mod.detail && <div className="mod__detail">{mod.detail}</div>}
        </li>
    );
}
