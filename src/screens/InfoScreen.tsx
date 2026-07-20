interface Props {
  onBack: () => void;
}

export function InfoScreen({ onBack }: Props) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(3rem,env(safe-area-inset-top))]">
      <p className="quiet-label">The rules of this hour</p>

      <div className="mt-6 flex flex-col gap-5">
        <p className="rounded-xl border border-night-2 bg-night-1 p-5 font-body text-[15px] leading-relaxed text-cream/90">
          No toe touches, forward folds, or sit-ups in this hour — your spinal discs are
          superhydrated after sleep and bending stress is ~3× higher. Deep stretching lives in
          the evening protocol.
        </p>
        <p className="rounded-xl border border-night-2 bg-night-1 p-5 font-body text-[15px] leading-relaxed text-cream/90">
          This should never feel hard. Target effort 3–4 out of 10. If your back hurts (not
          stiff — hurts), stop.
        </p>
      </div>

      <div className="mt-8">
        <p className="quiet-label mb-3">The shape of every session</p>
        <ol className="flex flex-col gap-2 font-body text-sm text-mist">
          <li><span className="text-cream/80">1 · Raise</span> — easy circulation on the floor</li>
          <li><span className="text-cream/80">2 · Mobilise</span> — ankles, hips, mid-back</li>
          <li><span className="text-cream/80">3 · Activate</span> — shoulder blades and hips</li>
          <li><span className="text-cream/80">4 · Potentiate</span> — heart rate up, kept light</li>
        </ol>
      </div>

      <div className="mt-auto flex justify-center pt-8">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full border-none bg-night-1 px-10 py-3.5 font-body text-sm font-semibold text-cream"
        >
          Back
        </button>
      </div>
    </div>
  );
}
