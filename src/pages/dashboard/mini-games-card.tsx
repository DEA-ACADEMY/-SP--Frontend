import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gift, RefreshCcw, RotateCcw, Sparkles, SpellCheck, Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";

const rewards = [
    "bonus",
    "badge",
    "quickWin",
    "theme",
    "motivation",
    "focus",
];

const scrambleWords = ["LEARN", "FOCUS", "GROWTH", "FUTURE", "SUCCESS", "PROJECT"];

function shuffleWord(word: string) {
    const chars = word.split("");
    for (let i = chars.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    const scrambled = chars.join("");
    return scrambled === word ? chars.reverse().join("") : scrambled;
}

const winningLines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
] as const;

type CellValue = "X" | "O" | null;

function getWinner(board: CellValue[]) {
    for (const [a, b, c] of winningLines) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}

function getBotMove(board: CellValue[]) {
    const empty = board
        .map((value, index) => (value === null ? index : -1))
        .filter((index) => index !== -1);

    if (!empty.length) return -1;
    if (board[4] === null) return 4;

    return empty[Math.floor(Math.random() * empty.length)];
}

function SpinWheelGame() {
    const { t } = useTranslation();
    const [rotation, setRotation] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const [result, setResult] = useState(t("dashboard.miniGames.spinPrompt"));

    const segmentAngle = useMemo(() => 360 / rewards.length, []);

    function handleSpin() {
        if (isSpinning) return;

        const rewardIndex = Math.floor(Math.random() * rewards.length);
        const targetAngle =
            360 * 6 + (360 - rewardIndex * segmentAngle - segmentAngle / 2);

        setIsSpinning(true);
        setRotation((prev) => prev + targetAngle);

        window.setTimeout(() => {
            setResult(t("dashboard.miniGames.youWon", { reward: t(`dashboard.miniGames.rewards.${rewards[rewardIndex]}`) }));
            setIsSpinning(false);
        }, 3600);
    }

    return (
        <Card className="border bg-card shadow-lg">
            <CardHeader>
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <CardTitle className="text-2xl font-bold text-foreground">
                            {t("dashboard.miniGames.spinWheel")}
                        </CardTitle>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {t("dashboard.miniGames.spinDescription")}
                        </p>
                    </div>
                    <Badge className="bg-primary text-primary-foreground hover:bg-primary">
                        {t("dashboard.miniGames.live")}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="absolute left-1/2 top-[-8px] z-10 h-0 w-0 -translate-x-1/2 border-l-[12px] border-r-[12px] border-b-[20px] border-l-transparent border-r-transparent border-b-primary" />

                        <div
                            className="relative h-72 w-72 overflow-hidden rounded-full border-[10px] border-primary shadow-xl transition-transform duration-[3600ms] ease-[cubic-bezier(0.18,0.9,0.2,1)]"
                            style={{
                                transform: `rotate(${rotation}deg)`,
                                background: "conic-gradient(var(--accent) 0deg 60deg, color-mix(in oklch, var(--primary) 30%, var(--card)) 60deg 120deg, var(--muted) 120deg 180deg, color-mix(in oklch, var(--primary) 20%, var(--card)) 180deg 240deg, var(--accent) 240deg 300deg, var(--card) 300deg 360deg)",
                            }}
                        >
                            {rewards.map((item, index) => {
                                const angle = index * segmentAngle + segmentAngle / 2;

                                return (
                                    <div
                                        key={item}
                                        className="absolute left-1/2 top-1/2 origin-center"
                                        style={{
                                            transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-88px)`,
                                        }}
                                    >
                                        <div className="-rotate-90 w-20 truncate text-center text-[10px] font-semibold leading-tight text-foreground sm:text-xs">
                                            {t(`dashboard.miniGames.rewards.${item}`)}
                                        </div>
                                    </div>
                                );
                            })}

                            <div className="absolute left-1/2 top-1/2 grid h-24 w-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-primary bg-card shadow-lg">
                                <div className="text-center">
                                    <Trophy className="mx-auto h-7 w-7 text-primary" />
                                    <div className="mt-1 text-sm font-bold text-foreground">
                                        {t("dashboard.miniGames.reward")}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                    <Button onClick={handleSpin} disabled={isSpinning} className="gap-2">
                        <Sparkles className="h-4 w-4" />
                        {isSpinning ? t("dashboard.miniGames.spinning") : t("dashboard.miniGames.spinNow")}
                    </Button>

                    <div className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-2 text-sm text-accent-foreground">
                        <Gift className="h-4 w-4" />
                        {result}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function WordScrambleGame() {
    const { t } = useTranslation();
    const [wordIndex, setWordIndex] = useState(0);
    const [answer, setAnswer] = useState("");
    const [message, setMessage] = useState(t("dashboard.miniGames.unscramble"));
    const [score, setScore] = useState(0);

    const currentWord = scrambleWords[wordIndex];
    const scrambled = useMemo(() => shuffleWord(currentWord), [currentWord]);

    function checkAnswer() {
        if (answer.trim().toUpperCase() === currentWord) {
            setScore((prev) => prev + 1);
            setMessage(t("dashboard.miniGames.correct"));
        } else {
            setMessage(t("dashboard.miniGames.tryAgain"));
        }
    }

    function nextWord() {
        setWordIndex((prev) => (prev + 1) % scrambleWords.length);
        setAnswer("");
        setMessage(t("dashboard.miniGames.newWord"));
    }

    return (
        <Card className="border bg-card shadow-lg">
            <CardHeader>
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <CardTitle className="text-2xl font-bold text-foreground">
                            {t("dashboard.miniGames.wordScramble")}
                        </CardTitle>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {t("dashboard.miniGames.wordDescription")}
                        </p>
                    </div>
                    <Badge className="bg-primary text-primary-foreground hover:bg-primary">
                        {t("dashboard.miniGames.live")}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="flex flex-wrap justify-center gap-2">
                    {scrambled.split("").map((char, index) => (
                        <div
                            key={`${char}-${index}`}
                            className="grid h-16 w-16 place-items-center rounded-2xl border bg-card text-2xl font-bold text-foreground shadow-sm"
                        >
                            {char}
                        </div>
                    ))}
                </div>

                <div className="mx-auto max-w-sm space-y-3">
                    <Input
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder={t("dashboard.miniGames.typeAnswer")}
                    />

                    <div className="flex gap-2">
                        <Button onClick={checkAnswer} className="flex-1 gap-2">
                            <SpellCheck className="h-4 w-4" />
                            {t("dashboard.miniGames.check")}
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={nextWord}
                            className="gap-2"
                        >
                            <RefreshCcw className="h-4 w-4" />
                            {t("dashboard.miniGames.next")}
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-accent px-4 py-3 text-sm">
                    <span className="font-medium text-accent-foreground">{message}</span>
                    <span className="text-muted-foreground">{t("dashboard.miniGames.score", { score })}</span>
                </div>
            </CardContent>
        </Card>
    );
}

function TicTacToeGame() {
    const { t } = useTranslation();
    const [board, setBoard] = useState<CellValue[]>(Array(9).fill(null));
    const [status, setStatus] = useState(t("dashboard.miniGames.yourTurn"));

    const winner = useMemo(() => getWinner(board), [board]);
    const isDraw = useMemo(() => !winner && board.every(Boolean), [winner, board]);

    function resetGame() {
        setBoard(Array(9).fill(null));
        setStatus(t("dashboard.miniGames.yourTurn"));
    }

    function handleMove(index: number) {
        if (board[index] || winner || isDraw) return;

        const nextBoard = [...board];
        nextBoard[index] = "X";

        const playerWinner = getWinner(nextBoard);
        if (playerWinner) {
            setBoard(nextBoard);
            setStatus(t("dashboard.miniGames.youWin"));
            return;
        }

        if (nextBoard.every(Boolean)) {
            setBoard(nextBoard);
            setStatus(t("dashboard.miniGames.draw"));
            return;
        }

        const botMove = getBotMove(nextBoard);
        if (botMove !== -1) {
            nextBoard[botMove] = "O";
        }

        const botWinner = getWinner(nextBoard);
        setBoard(nextBoard);

        if (botWinner) {
            setStatus(t("dashboard.miniGames.botWins"));
            return;
        }

        if (nextBoard.every(Boolean)) {
            setStatus(t("dashboard.miniGames.draw"));
            return;
        }

        setStatus(t("dashboard.miniGames.yourTurn"));
    }

    return (
        <Card className="border bg-card shadow-lg">
            <CardHeader>
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <CardTitle className="text-2xl font-bold text-foreground">
                            {t("dashboard.miniGames.ticTacToe")}
                        </CardTitle>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {t("dashboard.miniGames.ticDescription")}
                        </p>
                    </div>
                    <Badge className="bg-primary text-primary-foreground hover:bg-primary">
                        {t("dashboard.miniGames.live")}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="mx-auto grid max-w-[320px] grid-cols-3 gap-3">
                    {board.map((cell, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => handleMove(index)}
                            className="grid aspect-square place-items-center rounded-2xl border bg-card text-4xl font-bold text-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            {cell}
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-accent px-4 py-3 text-sm">
                    <span className="font-medium text-accent-foreground">{status}</span>
                    <Button variant="outline" onClick={resetGame} className="gap-2">
                        <RotateCcw className="h-4 w-4" />
                        {t("dashboard.miniGames.reset")}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export function MiniGamesSection() {
    const { t } = useTranslation();
    return (
        <div className="space-y-4">
            <div>

                <p className="text-sm text-muted-foreground">

                </p>
            </div>

            <Tabs defaultValue="spin" className="gap-4">
                <TabsList className="h-auto w-full flex-wrap justify-start gap-2 rounded-2xl bg-transparent p-0">
                    <TabsTrigger
                        value="spin"
                        className="rounded-xl border bg-card px-4 py-2 shadow-sm data-[state=active]:border-primary data-[state=active]:text-primary"
                    >
                        {t("dashboard.miniGames.spinWheel")}
                    </TabsTrigger>

                    <TabsTrigger
                        value="scramble"
                        className="rounded-xl border bg-card px-4 py-2 shadow-sm data-[state=active]:border-primary data-[state=active]:text-primary"
                    >
                        {t("dashboard.miniGames.wordScramble")}
                    </TabsTrigger>

                    <TabsTrigger
                        value="tic"
                        className="rounded-xl border bg-card px-4 py-2 shadow-sm data-[state=active]:border-primary data-[state=active]:text-primary"
                    >
                        {t("dashboard.miniGames.ticTacToe")}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="spin">
                    <SpinWheelGame />
                </TabsContent>

                <TabsContent value="scramble">
                    <WordScrambleGame />
                </TabsContent>

                <TabsContent value="tic">
                    <TicTacToeGame />
                </TabsContent>
            </Tabs>
        </div>
    );
}
