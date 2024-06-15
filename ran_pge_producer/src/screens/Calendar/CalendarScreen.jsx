import Calendar from '../../components/Calendar/areCalendar/Calendar';
import AreaTopCalendar from '../../components/Calendar/areaTopCalendar/AreaTopCalendar';

const CalendarScreen = () => {
    return (
        <div className="content-area">
          <AreaTopCalendar />
          <Calendar />
        </div>
      );
    }

export default CalendarScreen;



