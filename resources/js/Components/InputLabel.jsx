export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={
                'block text-xs font-semibold text-gray-500 uppercase tracking-wider ' +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}
