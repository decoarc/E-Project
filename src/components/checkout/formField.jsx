import "./formField.css";

export default function FormField({ id, label, error, className, children }) {
  const classes = ["formField", error ? "formFieldError" : "", className]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={classes}>
      <label className="formFieldLabel" htmlFor={id}>
        {label}
      </label>
      {children}
      {error && (
        <span className="formFieldErrorMsg" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
