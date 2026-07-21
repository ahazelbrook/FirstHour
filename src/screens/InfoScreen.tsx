import { useMeshPalette } from '../lib/useMeshPalette';

interface Props {
  onBack: () => void;
}

export function InfoScreen({ onBack }: Props) {
  useMeshPalette('home', 'home');

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-xl flex-col px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.75rem,env(safe-area-inset-top))]">
      <button
        type="button"
        onClick={onBack}
        className="accent-fade flex items-center gap-2 self-start border-none bg-transparent font-body text-sm text-mist"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M19 12H5M11 6l-6 6 6 6" />
        </svg>
        Back
      </button>

      <div className="mt-9">
        <p className="quiet-label" style={{ color: 'var(--accent)' }}>
          Before you start
        </p>
        <h1 className="serif-display mt-3.5 text-4xl text-cream">Two rules for the first hour</h1>
      </div>

      <div className="mt-7 flex flex-col gap-4">
        <p className="glass rounded-2xl p-5 font-body text-[15px] leading-relaxed text-cream/90">
          No toe touches, forward folds, or sit-ups in this hour — your spinal discs are
          superhydrated after sleep and bending stress is ~3× higher. Deep stretching lives in
          the evening protocol.
        </p>
        <p className="glass rounded-2xl p-5 font-body text-[15px] leading-relaxed text-cream/90">
          This should never feel hard. Target effort 3–4 out of 10. If your back hurts (not
          stiff — hurts), stop.
        </p>
      </div>

      <div className="mt-10">
        <p className="quiet-label mb-4">The shape of every session</p>
        <ol className="flex flex-col gap-2.5 font-body text-sm text-mist">
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
          className="glass accent-fade rounded-full px-10 py-3.5 font-body text-sm font-semibold text-cream"
        >
          Back
        </button>
      </div>
    </div>
  );
}
