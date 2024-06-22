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

              <div className="m-2 flex flex-col items-center gap-1">
                <p className="text-sm text-gray-500">v0.1.0</p>
                <p className="text-sm text-gray-500">
                  © 2024. jaericoke All rights reserved.
                </p>
                <a
                  href="https://www.threads.net/@jaericoke?hl=ko"
                  className="mt-2 h-6 w-6"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                    <path d="M331.5 235.7c2.2 .9 4.2 1.9 6.3 2.8c29.2 14.1 50.6 35.2 61.8 61.4c15.7 36.5 17.2 95.8-30.3 143.2c-36.2 36.2-80.3 52.5-142.6 53h-.3c-70.2-.5-124.1-24.1-160.4-70.2c-32.3-41-48.9-98.1-49.5-169.6V256v-.2C17 184.3 33.6 127.2 65.9 86.2C102.2 40.1 156.2 16.5 226.4 16h.3c70.3 .5 124.9 24 162.3 69.9c18.4 22.7 32 50 40.6 81.7l-40.4 10.8c-7.1-25.8-17.8-47.8-32.2-65.4c-29.2-35.8-73-54.2-130.5-54.6c-57 .5-100.1 18.8-128.2 54.4C72.1 146.1 58.5 194.3 58 256c.5 61.7 14.1 109.9 40.3 143.3c28 35.6 71.2 53.9 128.2 54.4c51.4-.4 85.4-12.6 113.7-40.9c32.3-32.2 31.7-71.8 21.4-95.9c-6.1-14.2-17.1-26-31.9-34.9c-3.7 26.9-11.8 48.3-24.7 64.8c-17.1 21.8-41.4 33.6-72.7 35.3c-23.6 1.3-46.3-4.4-63.9-16c-20.8-13.8-33-34.8-34.3-59.3c-2.5-48.3 35.7-83 95.2-86.4c21.1-1.2 40.9-.3 59.2 2.8c-2.4-14.8-7.3-26.6-14.6-35.2c-10-11.7-25.6-17.7-46.2-17.8H227c-16.6 0-39 4.6-53.3 26.3l-34.4-23.6c19.2-29.1 50.3-45.1 87.8-45.1h.8c62.6 .4 99.9 39.5 103.7 107.7l-.2 .2zm-156 68.8c1.3 25.1 28.4 36.8 54.6 35.3c25.6-1.4 54.6-11.4 59.5-73.2c-13.2-2.9-27.8-4.4-43.4-4.4c-4.8 0-9.6 .1-14.4 .4c-42.9 2.4-57.2 23.2-56.2 41.8l-.1 .1z" />
                  </svg>
                </a>
                {/* threads icon, instagram icon with links */}
              </div>
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
