import AreaactivateTop from '../../components/activate/AreatopActivate/AreaactivateTop';
import Areaactivate from '../../components/activate/areaActivate/Areaactivate';
import AreaEvaluation from '../../components/activate/AreaEvaluation/AreaEvaluation';
const ActivateScreen = () => {
  return (
    <div className="content-area">
      <AreaactivateTop />
      <Areaactivate />
      <AreaEvaluation />
    </div>
  );
};

export default ActivateScreen;
