import { useState, FormEvent } from "react";
import axios from "axios";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
);

const metrics = [
  "육체적 힘듦",
  "정신적 노력",
  "시간 투자",
  "기술적 복잡성",
  "사회적 도전",
  "재정적 부담",
  "위험도",
  "지속성 요구",
  "창의성 요구",
  "희소성",
];

interface Result {
  id: number;
  experience: string;
  level: number;
  total_difficulty: number;
  similarity: number;
  difficulty_scores: number[];
}

const api = axios.create({
  baseURL: "https://sacred-sher-gaoridang-eec88f54.koyeb.app",
});

export default function App() {
  const [experience, setExperience] = useState<string>("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await api.post<Result>("/api/estimate", {
        text: experience,
      });
      setResult(response.data);
    } catch (error) {
      console.error("Error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "난이도 측정 중 알 수 없는 오류가 발생했습니다.",
      );
      setResult(null);
    }
    setLoading(false);
  };

  const chartData = result
    ? {
        labels: metrics,
        datasets: [
          {
            label: "난이도 점수",
            data: result.difficulty_scores,
            backgroundColor: "rgba(99, 102, 241, 0.2)",
            borderColor: "rgba(99, 102, 241, 1)",
            borderWidth: 2,
          },
        ],
      }
    : null;

  const chartOptions = {
    scales: {
      r: {
        angleLines: {
          display: true,
        },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-100 py-6 sm:py-12">
      <div className="relative py-3 sm:mx-auto sm:max-w-xl">
        <div className="absolute inset-0 -skew-y-6 transform bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg sm:-rotate-6 sm:skew-y-0 sm:rounded-3xl"></div>
        <div className="relative bg-white px-4 py-10 shadow-lg sm:rounded-3xl sm:p-20">
          <div className="mx-auto max-w-md">
            <h1 className="mb-6 text-center text-2xl font-semibold text-gray-900">
              경험 난이도 측정기
            </h1>
            <form onSubmit={handleSubmit} className="mb-6">
              <input
                type="text"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="경험을 입력하세요"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? "측정 중..." : "난이도 측정"}
              </button>
            </form>
            {error && <p className="mb-4 text-red-600">{error}</p>}
            {result && (
              <div className="result">
                <h2 className="mb-4 text-xl font-semibold">결과</h2>
                <p className="mb-2">
                  <span className="font-medium">경험:</span> {result.experience}
                </p>
                <p className="mb-2">
                  <span className="font-medium">난이도 레벨:</span>{" "}
                  {result.level}
                </p>
                <p className="mb-2">
                  <span className="font-medium">총 난이도:</span>{" "}
                  {result.total_difficulty.toFixed(2)}
                </p>
                {result.similarity > 0 && (
                  <p className="mb-4">
                    <span className="font-medium">유사한 경험과의 유사도:</span>{" "}
                    {(result.similarity * 100).toFixed(2)}%
                  </p>
                )}
                <div className="chart-container mb-6">
                  {chartData && (
                    <Radar data={chartData} options={chartOptions} />
                  )}
                </div>
                <h3 className="mb-2 text-lg font-semibold">
                  세부 난이도 점수:
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          항목
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          점수
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {result.difficulty_scores.map((score, index) => (
                        <tr key={index}>
                          <td className="whitespace-nowrap px-4 py-2">
                            {metrics[index]}
                          </td>
                          <td className="whitespace-nowrap px-4 py-2">
                            {score.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
