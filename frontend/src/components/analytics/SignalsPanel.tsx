import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CircleAlert,
} from "lucide-react"


type Signal = {
  type: string
  title: string
  message: string
}


type Props = {
  signals: Signal[]
}


function SignalsPanel({
  signals,
}: Props) {
  function signalIcon(
    type: string
  ) {
    if (type === "positive") {
      return (
        <ArrowUpRight
          size={18}
          className="text-emerald-600"
        />
      )
    }

    if (type === "negative") {
      return (
        <ArrowDownRight
          size={18}
          className="text-red-600"
        />
      )
    }

    if (type === "warning") {
      return (
        <AlertTriangle
          size={18}
          className="text-amber-600"
        />
      )
    }

    return (
      <CircleAlert
        size={18}
        className="text-blue-600"
      />
    )
  }


  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

      <div className="mb-5">

        <h3 className="text-base font-semibold text-gray-900">
          Key Signals
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Important changes and opportunities
        </p>

      </div>


      {signals.length === 0 ? (
        <p className="text-sm text-gray-500">
          No signals detected for this period.
        </p>
      ) : (
        <div className="space-y-3">

          {signals.map(
            (signal, index) => (
              <div
                key={`${signal.title}-${index}`}
                className="flex gap-3 rounded-xl border border-gray-100 p-4"
              >

                <div className="mt-0.5">
                  {signalIcon(
                    signal.type
                  )}
                </div>


                <div>

                  <p className="text-sm font-semibold text-gray-900">
                    {signal.title}
                  </p>

                  <p className="mt-1 text-sm leading-5 text-gray-500">
                    {signal.message}
                  </p>

                </div>

              </div>
            )
          )}

        </div>
      )}

    </div>
  )
}


export default SignalsPanel