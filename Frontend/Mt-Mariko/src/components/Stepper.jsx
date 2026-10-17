import { FaCheck } from "react-icons/fa";

/**
 * Responsive multi-step progress indicator.
 *
 * @param {Array<{id:string,title:string,icon?:JSX.Element}>} steps
 * @param {number} currentStep  0-based index of the active step
 * @param {(index:number)=>void} [onStepClick]  optional — jump to a completed step
 */
export default function Stepper({ steps, currentStep, onStepClick }) {
  const total = steps.length;
  const progress = total > 1 ? (currentStep / (total - 1)) * 100 : 100;

  return (
    <div className="w-full">
      {/* Desktop / tablet: full horizontal stepper */}
      <div className="hidden sm:block">
        <div className="relative flex items-start justify-between">
          {/* Track */}
          <div className="absolute left-0 right-0 top-5 h-0.5 bg-gray-200" aria-hidden="true">
            <div
              className="h-0.5 bg-blue-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {steps.map((step, index) => {
            const isDone = index < currentStep;
            const isActive = index === currentStep;
            const clickable = isDone && typeof onStepClick === "function";
            return (
              <button
                key={step.id}
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onStepClick(index)}
                className={`relative z-10 flex flex-col items-center flex-1 focus:outline-none ${
                  clickable ? "cursor-pointer group" : "cursor-default"
                }`}
                aria-current={isActive ? "step" : undefined}
              >
                <span
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-semibold transition-all duration-300
                    ${
                      isDone
                        ? "bg-blue-600 border-blue-600 text-white group-hover:bg-blue-700"
                        : isActive
                          ? "bg-white border-blue-600 text-blue-600 ring-4 ring-blue-100"
                          : "bg-white border-gray-300 text-gray-400"
                    }`}
                >
                  {isDone ? <FaCheck className="text-xs" /> : step.icon || index + 1}
                </span>
                <span
                  className={`mt-2 text-center text-xs font-medium leading-tight px-1 transition-colors
                    ${isActive ? "text-blue-700" : isDone ? "text-gray-700" : "text-gray-400"}`}
                >
                  {step.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile: compact "Step X of Y" + progress bar */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-blue-700">
            Intambwe {currentStep + 1}/{total}
          </span>
          <span className="text-xs text-gray-500 truncate ml-2">
            {steps[currentStep]?.title}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
