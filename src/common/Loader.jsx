
function Loader() {
  return (
    <div
      className="
        fixed
        inset-0
        z-99999
        flex
        items-center
        justify-center
        bg-black
      "
    >
      <div className="relative h-20 w-20">
        {/* Soft outer aura */}
        <div
          className="
            absolute
            inset-0
            rounded-full
            bg-white/10
            blur-2xl
            animate-pulse
          "
        />

        {/* Rotating comet */}
        <div
          className="
            absolute
            inset-0
            animate-spin
            rounded-full
          "
          style={{ animationDuration: "1.4s" }}
        >
          {/* Faded ring */}
          <div
            className="
              absolute
              inset-2
              rounded-full
              border-2
              border-white/10
            "
          />

          {/* Comet trail */}
          <div
            className="
              absolute
              left-1/2
              top-0
              h-1/2
              w-0.75
              -translate-x-1/2
              rounded-full
              bg-linear-to-b
              from-white
              via-white/40
              to-transparent
              blur-[1px]
            "
          />

          {/* Comet head */}
          <div
            className="
              absolute
              left-1/2
              -top-0.5
              h-3
              w-3
              -translate-x-1/2
              rounded-full
              bg-white
              shadow-[0_0_6px_2px_rgba(255,255,255,1),0_0_18px_6px_rgba(255,255,255,0.65),0_0_35px_12px_rgba(255,255,255,0.25)]
            "
          />

          {/* Bright core */}
          <div
            className="
              absolute
              left-1/2
              -top-px
              h-1
              w-1
              -translate-x-1/2
              rounded-full
              bg-white
            "
          />
        </div>

        {/* Center point */}
        <div
          className="
            absolute
            left-1/2
            top-1/2
            h-1.5
            w-1.5
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-white
            shadow-[0_0_10px_3px_rgba(255,255,255,0.5)]
          "
        />
      </div>
    </div>
  );
}

export default Loader;