import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

const API_URL = 'https://countriesnow.space/api/v0.1/countries/flag/images';
const LEADERBOARD_KEY = 'banderasQuizLeaderboard';

const readStoredLeaderboard = async () => {
  try {
    if (typeof globalThis === 'undefined' || !globalThis.localStorage) {
      return [];
    }

    const saved = globalThis.localStorage.getItem(LEADERBOARD_KEY);
    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? sortPlayers(parsed) : [];
  } catch (error) {
    console.error('Error loading leaderboard:', error);
    return [];
  }
};

const saveStoredLeaderboard = async (list = []) => {
  try {
    if (typeof globalThis === 'undefined' || !globalThis.localStorage) {
      return;
    }

    globalThis.localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(sortPlayers(list)));
  } catch (error) {
    console.error('Error saving leaderboard:', error);
  }
};

const GameContext = createContext(null);

const sortPlayers = (list = []) =>
  [...list]
    .map((player) => ({
      ...player,
      score: Number(player?.score) || 0,
      name: String(player?.name || 'Jugador').trim() || 'Jugador',
    }))
    .sort((a, b) => b.score - a.score);

const buildInitialPlayers = (playerName = 'Jugador') => [
  {
    id: `player-${Date.now()}`,
    name: playerName.trim() || 'Jugador',
    score: 0,
  },
];

const normalizePlayerName = (value = '') => (String(value).trim() || 'Jugador');

const normalizeText = (value = '') =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

const normalizeFlagUrl = (value) => {
  if (!value) {
    return '';
  }

  const url = String(value).trim();

  if (!url) {
    return '';
  }

  return url.startsWith('http://') ? `https://${url.slice('http://'.length)}` : url;
};

const resolveFlagUrl = (value) => {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return normalizeFlagUrl(value);
  }

  if (typeof value === 'object') {
    return normalizeFlagUrl(
      value?.png ||
      value?.svg ||
      value?.url ||
      value?.image ||
      value?.src ||
      value?.flag ||
      ''
    );
  }

  return '';
};

const getCountryFlagUrl = (item) => {
  const iso2 = item?.iso2?.trim();

  if (iso2) {
    return `https://flagcdn.com/w320/${iso2.toLowerCase()}.png`;
  }

  return '';
};

const buildCountryList = (payload) => {
  const source =
    Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.countries)
          ? payload.countries
          : Array.isArray(payload?.objects)
            ? payload.objects
            : [];

  return source
    .map((item, index) => {
      const candidateName =
        item?.name ||
        item?.country ||
        item?.countryName ||
        item?.country_name ||
        item?.name?.common ||
        item?.name?.official ||
        item?.country_name ||
        item?.countryName;

      const svgFallback =
        resolveFlagUrl(item?.flag) ||
        resolveFlagUrl(item?.flagUrl) ||
        resolveFlagUrl(item?.flag_url) ||
        resolveFlagUrl(item?.image) ||
        resolveFlagUrl(item?.imageUrl) ||
        resolveFlagUrl(item?.icon) ||
        resolveFlagUrl(item?.url) ||
        resolveFlagUrl(item?.flags);

      const candidateFlag =
        (typeof item?.iso2 === 'string' && item.iso2.trim())
          ? getCountryFlagUrl(item)
          : svgFallback;

      if (!candidateName || !candidateFlag) {
        return null;
      }

      return {
        id: `${normalizeText(String(candidateName))}-${index}`,
        name: String(candidateName).trim(),
        flag: String(candidateFlag).trim(),
      };
    })
    .filter(Boolean);
};

const pickRandomCountry = (countries, excludeName = '') => {
  if (!countries.length) {
    return null;
  }

  const filtered = excludeName
    ? countries.filter((country) => normalizeText(country.name) !== normalizeText(excludeName))
    : countries;

  const source = filtered.length ? filtered : countries;
  const randomIndex = Math.floor(Math.random() * source.length);
  return source[randomIndex];
};

export function GameProvider({ children }) {
  const [countries, setCountries] = useState([]);
  const [currentCountry, setCurrentCountry] = useState(null);
  const [score, setScore] = useState(0);
  const [guess, setGuess] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [resultStatus, setResultStatus] = useState('idle');
  const [isLoading, setIsLoading] = useState(true);
  const [timer, setTimer] = useState(20);
  const [playerName, setPlayerName] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const nextCountryTimeoutRef = useRef(null);
  const [players, setPlayers] = useState(() => buildInitialPlayers('Jugador'));

  useEffect(() => {
    const loadLeaderboard = async () => {
      const list = await readStoredLeaderboard();
      if (list.length) {
        setPlayers(list);
      }
    };

    loadLeaderboard();
  }, []);

  useEffect(() => {
    const nextName = normalizePlayerName(playerName);

    setPlayers((previousPlayers) => {
      const current = sortPlayers(previousPlayers);
      const currentPlayer = current.find((player) => player.name === nextName);

      if (currentPlayer) {
        return sortPlayers(
          current.map((player) =>
            player.name === nextName ? { ...player, score } : player
          )
        );
      }

      return sortPlayers([
        ...current,
        {
          id: `player-${Date.now()}`,
          name: nextName,
          score,
        },
      ]);
    });
  }, [playerName, score]);

  const persistLeaderboard = async (list = players) => {
    await saveStoredLeaderboard(list);
  };

  useEffect(() => {
    persistLeaderboard(players);
  }, [players]);

  useEffect(() => {
    return () => {
      if (nextCountryTimeoutRef.current) {
        clearTimeout(nextCountryTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const response = await fetch(API_URL, {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error('No se pudieron cargar los países');
        }

        const data = await response.json();
        const normalizedCountries = buildCountryList(data);

        setCountries(normalizedCountries);
        const firstCountry = pickRandomCountry(normalizedCountries);
        setCurrentCountry(firstCountry);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCountries();
  }, []);

  useEffect(() => {
    if (!currentCountry) {
      return undefined;
    }

    setGuess('');
    setErrorMessage('');
    setResultStatus('idle');
    setTimer(20);

    const countdown = setInterval(() => {
      setTimer((previousTimer) => {
        if (previousTimer <= 1) {
          clearInterval(countdown);
          return 0;
        }

        return previousTimer - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [currentCountry]);

  const nextCountry = () => {
    if (!countries.length) {
      return;
    }

    const next = pickRandomCountry(countries, currentCountry?.name);
    setCurrentCountry(next);
  };

  const advanceToNextCountry = () => {
    if (nextCountryTimeoutRef.current) {
      clearTimeout(nextCountryTimeoutRef.current);
    }

    setIsTransitioning(true);
    nextCountryTimeoutRef.current = setTimeout(() => {
      setIsTransitioning(false);
      nextCountry();
    }, 3000);
  };

  const startGame = () => {
    const nextName = normalizePlayerName(playerName);
    setPlayerName(nextName);
    setResultStatus('idle');
    setGameStarted(true);
  };

  const resetGame = async () => {
    const finalPlayers = sortPlayers(players);
    await persistLeaderboard(finalPlayers);
    setScore(0);
    setGuess('');
    setErrorMessage('');
    setResultStatus('idle');
    setTimer(20);
    setGameStarted(false);
  };

  const submitGuess = () => {
    if (!currentCountry || isTransitioning) {
      return;
    }

    const trimmedGuess = guess.trim();

    if (!trimmedGuess) {
      setErrorMessage('Ingresa un país para jugar.');
      setResultStatus('fail');
      return;
    }

    const normalizedGuess = normalizeText(trimmedGuess);
    const normalizedAnswer = normalizeText(currentCountry.name);
    const isCorrect = normalizedGuess === normalizedAnswer || normalizedAnswer.includes(normalizedGuess) || normalizedGuess.includes(normalizedAnswer);

    if (isCorrect) {
      setScore((previousScore) => previousScore + 10);
      setErrorMessage('¡Correcto!');
      setResultStatus('success');
    } else {
      setScore((previousScore) => previousScore - 1);
      setErrorMessage(`Incorrecto. La respuesta era ${currentCountry.name}.`);
      setResultStatus('fail');
    }

    setGuess('');
    advanceToNextCountry();
  };

  const value = useMemo(
    () => ({
      countries,
      currentCountry,
      score,
      guess,
      setGuess,
      timer,
      players,
      isLoading,
      errorMessage,
      resultStatus,
      playerName,
      gameStarted,
      isTransitioning,
      setPlayerName,
      startGame,
      resetGame,
      nextCountry,
      submitGuess,
      resetScore: () => setScore(0),
      setCurrentCountry,
    }),
    [countries, currentCountry, score, guess, timer, players, isLoading, errorMessage, resultStatus, playerName, gameStarted, isTransitioning]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGameContext() {
  const context = useContext(GameContext);

  if (!context) {
    throw new Error('useGameContext debe usarse dentro de GameProvider');
  }

  return context;
}
