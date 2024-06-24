import React, { useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const API_URL = `${import.meta.env.VITE_BASE_URL}/api`;

interface ExperienceWithScore {
  id: number;
  text: string;
  difficulty_score: number;
  relative_difficulty: number;
}

interface AdjacentExperiences {
  lower: ExperienceWithScore | null;
  higher: ExperienceWithScore | null;
}

interface EstimationResult {
  user_experience: ExperienceWithScore;
  adjacent_experiences: AdjacentExperiences;
  total_experiences: number;
}

interface ComparisonResult {
  id: number;
  text: string;
  difficulty_score: number;
  relative_difficulty: number;
}

const ExperienceDifficultyEstimator: React.FC = () => {
  const [experience, setExperience] = useState<string>("");
  const [result, setResult] = useState<EstimationResult | null>(null);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await axios.post<EstimationResult>(
        `${API_URL}/estimate`,
        { text: experience },
      );
      setResult(response.data);
    } catch (err) {
      setError("난이도 추정 중 오류가 발생했습니다. 다시 시도해 주세요.");
      console.error(err);
    }
    setLoading(false);
  };

  const handleCompare = async (
    isMoreDifficult: boolean,
    isLessDifficult: boolean,
  ) => {
    if (!result) return;
    setLoading(true);
    setError("");
    try {
      const response = await axios.post<ComparisonResult>(
        `${API_URL}/compare`,
        {
          experience_id: result.user_experience.id,
          is_more_difficult_than_lower: isMoreDifficult,
          is_less_difficult_than_higher: isLessDifficult,
        },
      );
      setComparison(response.data);
    } catch (err) {
      setError("비교 결과 제출 중 오류가 발생했습니다. 다시 시도해 주세요.");
      console.error(err);
    }
    setLoading(false);
  };

  const chartData = result
    ? [
        {
          name: "이전 경험",
          difficulty:
            result.adjacent_experiences.lower?.relative_difficulty || 0,
        },
        {
          name: "내 경험",
          difficulty: result.user_experience.relative_difficulty,
        },
        {
          name: "다음 경험",
          difficulty:
            result.adjacent_experiences.higher?.relative_difficulty || 100,
        },
      ]
    : [];

  return (
    <div className="mx-auto max-w-4xl p-4">
      <h1 className="mb-4 text-3xl font-bold">경험 난이도 추정기</h1>

      <form onSubmit={handleSubmit} className="mb-8">
        <textarea
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          placeholder="당신의 경험을 설명해주세요..."
          className="mb-2 w-full rounded border p-2"
          rows={4}
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-blue-500 px-4 py-2 text-white"
        >
          {loading ? "추정 중..." : "난이도 추정하기"}
        </button>
      </form>

      {error && <p className="mb-4 text-red-500">{error}</p>}

      {result && (
        <div className="mb-8">
          <h2 className="mb-2 text-2xl font-bold">추정 결과</h2>
          <p>
            난이도 점수: {result.user_experience.difficulty_score.toFixed(2)}
          </p>
          <p>
            상대적 난이도 (백분위):{" "}
            {result.user_experience.relative_difficulty.toFixed(2)}
          </p>

          <h3 className="mb-2 mt-4 text-xl font-bold">비교</h3>
          <p>
            귀하의 경험이 이것보다 더 어렵나요?:{" "}
            {result.adjacent_experiences.lower?.text || "해당 없음"}
          </p>
          <p>
            귀하의 경험이 이것보다 덜 어렵나요?:{" "}
            {result.adjacent_experiences.higher?.text || "해당 없음"}
          </p>

          <div className="mt-2 flex space-x-2">
            <button
              onClick={() => handleCompare(true, false)}
              className="rounded bg-green-500 px-2 py-1 text-white"
            >
              더 어려움
            </button>
            <button
              onClick={() => handleCompare(false, true)}
              className="rounded bg-yellow-500 px-2 py-1 text-white"
            >
              덜 어려움
            </button>
            <button
              onClick={() => handleCompare(true, true)}
              className="rounded bg-blue-500 px-2 py-1 text-white"
            >
              중간
            </button>
            <button
              onClick={() => handleCompare(false, false)}
              className="rounded bg-red-500 px-2 py-1 text-white"
            >
              둘 다 아님
            </button>
          </div>

          <div className="mt-4">
            <h3 className="mb-2 text-xl font-bold">상대적 난이도 비교</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis
                  domain={[0, 100]}
                  label={{
                    value: "백분위",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="difficulty" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {comparison && (
        <div>
          <h2 className="mb-2 text-2xl font-bold">최종 결과</h2>
          <p>
            업데이트된 난이도 점수: {comparison.difficulty_score.toFixed(2)}
          </p>
          <p>
            업데이트된 상대적 난이도 (백분위):{" "}
            {comparison.relative_difficulty.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
};

export default ExperienceDifficultyEstimator;
