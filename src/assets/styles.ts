  // kolor tła zależny od statusu
  const currPromiles = output?.timeline?.length
    ? output.timeline[output.timeline.length - 1].promiles
    : 0;
  const isGreenPhase = currPromiles <= 0.2;
  const panelBg = isGreenPhase
    ? "linear-gradient(180deg,#E8F5E9 0%,#FFFFFF 60%)"
    : "linear-gradient(180deg,#FFEBEE 0%,#FFFFFF 60%)";
