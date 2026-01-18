import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { PerformanceView } from './components/PerformanceView';
import { WeatherView } from './components/WeatherView';
import { AICopilotView } from './components/AICopilotView';
import { FlightPlanView } from './components/FlightPlanView';
import { LibraryView } from './components/LibraryView';
import { ChecklistView } from './components/ChecklistView';
import { ViewState, WeatherData, FlightPlanData, PerformanceState, FlightPlanState, WeatherState, ChecklistCategory } from './types';
import { INITIAL_CHECKLISTS } from './data/checklists';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('FLIGHTPLAN');
  const [theme, setTheme] = useState<'day' | 'night'>('day');

  // Lifted Weather State
  const [weatherState, setWeatherState] = useState<WeatherState>({
    searchIcao: '',
    data: null,
    sources: [],
    error: null
  });

  // Lifted Flight Plan State
  const [flightPlanState, setFlightPlanState] = useState<FlightPlanState>({
    inputs: {
      origin: '',
      dest: '',
      dist: '',
      pax: '156',
      cargo: '4000',
      fuel: '15000',
      emptyWeight: '85710'
    },
    results: null
  });

  // Computed FlightPlanData compatibility for PerformanceView
  const flightPlanData: FlightPlanData | null = React.useMemo(() => {
    return flightPlanState.results ? {
      origin: flightPlanState.inputs.origin,
      dest: flightPlanState.inputs.dest,
      distance: Number(flightPlanState.inputs.dist),
      pax: Number(flightPlanState.inputs.pax),
      cargo: Number(flightPlanState.inputs.cargo),
      fuel: Number(flightPlanState.inputs.fuel),
      tripFuel: flightPlanState.results.tripFuel,
      reserve: flightPlanState.results.reserve,
      zfw: flightPlanState.results.zfw,
      gw: flightPlanState.results.gw,
      landingWeight: flightPlanState.results.landingWeight
    } : null;
  }, [flightPlanState.results, flightPlanState.inputs]);

  // Lifted Performance State
  const [performanceState, setPerformanceState] = useState<PerformanceState>({
    mode: 'TAKEOFF',
    takeoffData: {
      runway: '27R',
      weightLbs: 155000,
      oatCelsius: 15,
      altFt: 80,
      windDir: 270,
      windSpeed: 12,
      flaps: 5,
      runwayCondition: 'DRY'
    },
    landingData: {
      runway: 'INVALID',
      landingWeightLbs: 145000,
      flaps: 30,
      windSpeed: 12,
      windDir: 270,
      distanceNm: 0
    },
    descentData: {
      cruiseAlt: 35000,
      targetAlt: 3000,
      speed: 280
    },
    takeoffResults: null,
    landingResults: null,
    descentResults: null
  });

  // Lifted Checklist State
  const [checklists, setChecklists] = useState<ChecklistCategory[]>(INITIAL_CHECKLISTS);

  // Lifted Chat Messages
  const [messages, setMessages] = useState<import('./types').ChatMessage[]>([
    { role: 'model', text: 'Captain, I am online and aware of your current flight data. Feel free to ask me anything about your flight plan, performance calculations, weather, or any aviation topic!' }
  ]);

  // Aircraft Config State
  const [aircraftConfig, setAircraftConfig] = useState<import('./services/aircraftService').AircraftConfig | null>(null);

  React.useEffect(() => {
    const loadCfg = async () => {
      const cfg = await import('./services/aircraftService').then(m => m.fetchLocalAircraftConfig());
      if (cfg) setAircraftConfig(cfg);
    };
    loadCfg();
  }, []);

  const handleChecklistToggle = (categoryId: string, itemId: string) => {
    setChecklists(prev => prev.map(cat => {
      if (cat.id !== categoryId) return cat;
      return {
        ...cat,
        items: cat.items.map(item => {
          if (item.id !== itemId) return item;
          return { ...item, checked: !item.checked };
        })
      };
    }));
  };

  const handleChecklistReset = () => {
    if (confirm('Reset all checklists?')) {
      setChecklists(INITIAL_CHECKLISTS);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'PERFORMANCE':
        return (
          <PerformanceView
            weatherData={weatherState.data}
            flightPlanData={flightPlanData}
            state={performanceState}
            onUpdate={setPerformanceState}
          />
        );
      case 'WEATHER':
        return (
          <WeatherView
            state={weatherState}
            onUpdate={setWeatherState}
            defaultIcao={flightPlanState.inputs.origin} // Pass origin as suggestion
          />
        );
      case 'AI_COPILOT':
        return (
          <AICopilotView
            weatherData={weatherState.data}
            flightPlanData={flightPlanData}
            performanceState={performanceState}
            checklists={checklists}
            aircraftConfig={aircraftConfig}
            messages={messages}
            setMessages={setMessages}
          />
        );
      case 'FLIGHTPLAN':
        return (
          <FlightPlanView
            state={flightPlanState}
            onUpdate={setFlightPlanState}
          />
        );
      case 'LIBRARY':
        return <LibraryView />;
      case 'CHECKLIST':
        return (
          <ChecklistView
            checklists={checklists}
            onToggle={handleChecklistToggle}
            onReset={handleChecklistReset}
          />
        );
      default:
        return (
          <PerformanceView
            weatherData={weatherState.data}
            flightPlanData={flightPlanData}
            state={performanceState}
            onUpdate={setPerformanceState}
          />
        );
    }
  };

  return (
    <div className={theme === 'night' ? 'night-mode' : ''}>
      <Layout
        currentView={currentView}
        onViewChange={setCurrentView}
        theme={theme}
        onThemeToggle={() => setTheme(t => t === 'day' ? 'night' : 'day')}
      >
        {renderView()}
      </Layout>
    </div>
  );
};

export default App;
