'use client';

import { useState } from 'react';

type EventType = 'festival' | 'sports' | 'mt' | 'exam';
type Budget = 'small' | 'medium' | 'large';
type Target = 'freshman' | 'student' | 'female';

interface Business {
  id: string;
  name: string;
  emoji: string;
  baseScore: number;
}

interface ScoreResult {
  business: Business;
  base: number;
  eventBonus: number;
  targetBonus: number;
  budgetBonus: number;
  total: number;
  strategy: string;
}

const businesses: Business[] = [
  { id: 'cafe', name: '카페', emoji: '☕', baseScore: 50 },
  { id: 'chicken', name: '치킨집', emoji: '🍗', baseScore: 48 },
  { id: 'fitness', name: '피트니스', emoji: '💪', baseScore: 40 },
  { id: 'photo', name: '사진관', emoji: '📸', baseScore: 38 },
  { id: 'convenience', name: '편의점', emoji: '🏪', baseScore: 42 },
  { id: 'studyroom', name: '독서실', emoji: '📚', baseScore: 45 },
  { id: 'bakery', name: '베이커리', emoji: '🥐', baseScore: 38 },
  { id: 'karaoke', name: '노래방', emoji: '🎤', baseScore: 42 },
  { id: 'pcroom', name: 'PC방', emoji: '🖥️', baseScore: 40 },
  { id: 'buffet', name: '뷔페', emoji: '🍽️', baseScore: 44 },
  { id: 'nail', name: '네일샵', emoji: '💅', baseScore: 35 },
  { id: 'studycafe', name: '스터디카페', emoji: '📖', baseScore: 45 },
];

const eventWeights: Record<EventType, Partial<Record<string, number>>> = {
  festival: { cafe: 15, chicken: 18, photo: 22, convenience: 8, karaoke: 12, buffet: 8 },
  sports: { chicken: 25, convenience: 20, fitness: 18, buffet: 12, bakery: 5 },
  mt: { buffet: 22, karaoke: 25, chicken: 18, convenience: 15, pcroom: 15, fitness: 8 },
  exam: { cafe: 25, studyroom: 25, bakery: 20, studycafe: 25, convenience: 15 },
};

const targetWeights: Record<Target, Partial<Record<string, number>>> = {
  freshman: { photo: 12, fitness: 10, cafe: 8, karaoke: 8 },
  student: { chicken: 10, karaoke: 10, pcroom: 10, convenience: 8 },
  female: { cafe: 12, nail: 15, bakery: 12, photo: 15, studycafe: 8 },
};

const budgetWeights: Record<Budget, Partial<Record<string, number>>> = {
  small: { convenience: 8, cafe: 5, bakery: 5 },
  medium: { chicken: 8, fitness: 5, karaoke: 5, pcroom: 5 },
  large: { buffet: 10, fitness: 8, karaoke: 8, photo: 8 },
};

const strategies: Record<EventType, Partial<Record<string, string>>> = {
  festival: {
    cafe: '부스 음료 할인 쿠폰 배포 → 방문 트래픽 유입 효과 극대화',
    chicken: '축제 뒤풀이 단체 할인 이벤트 → 구매 전환율 높음',
    photo: '축제 기념 인생네컷·프로필 촬영 패키지 제공',
    karaoke: '축제 마감 후 단체 할인 쿠폰 배포',
    buffet: '단체 식사 패키지 + 학교 로고 현수막 설치',
    convenience: '부스 운영 음료·간식 스폰서십',
    fitness: '축제 기간 무료 PT 체험권 증정',
    studycafe: '축제 후 복습 이용권 프로모션',
    bakery: '축제 한정 디저트 세트 할인 쿠폰',
    studyroom: '축제 기간 무료 이용권 증정 이벤트',
    pcroom: '축제 여흥 게임 이벤트 쿠폰',
    nail: '축제 셀프 네일 케어 쿠폰 배포',
  },
  sports: {
    chicken: '체육대회 뒤풀이 쿠폰 대량 배포 → 단체 주문 유도',
    convenience: '경기 중 음료·간식 현장 협찬 → 브랜드 노출',
    fitness: '우승팀 무료 PT 체험권 시상 이벤트',
    buffet: '시상식 후 단체 회식 패키지 제공',
    bakery: '경기 사이 에너지 간식 쿠폰 현장 배포',
    cafe: '경기 전·후 음료 할인 쿠폰 배포',
    karaoke: '뒤풀이 단체 할인 이벤트',
    photo: '우승 기념 단체 촬영 이벤트',
    studyroom: '체육대회 이후 집중 공부 이용권 배포',
    pcroom: '체육대회 이후 여흥 할인 이용권',
    nail: '시상식 기념 네일 케어 쿠폰',
    studycafe: '체육대회 이후 공부 복귀 이용권',
  },
  mt: {
    buffet: 'MT 단체 식사 패키지 → 비용 절감 + 장소 홍보 효과',
    karaoke: 'MT 마지막 밤 단체 할인 쿠폰 배포',
    chicken: 'MT 뒤풀이 배달 전용 할인 코드 제공',
    convenience: '이동 중 간식·음료 할인 쿠폰',
    pcroom: '우천 시 실내 대체 활동 쿠폰 준비',
    fitness: 'MT 체력 단련 프로그램 연계 이벤트',
    cafe: 'MT 출발 전·귀환 후 음료 할인 쿠폰',
    photo: 'MT 기념 단체 사진 촬영 패키지',
    bakery: 'MT 아침 도시락 간식 세트 협찬',
    studyroom: 'MT 이후 시험 대비 이용권 배포',
    nail: 'MT 기념 소품 네일 이벤트',
    studycafe: 'MT 이후 집중 공부 복귀 이용권',
  },
  exam: {
    cafe: '시험기간 음료 할인 → 오전 집중 케어 패키지',
    studyroom: '무료 이용권 선착순 지급 → SNS 바이럴 유도',
    bakery: '새벽 공부 간식 세트 할인 쿠폰 배포',
    studycafe: '시험기간 전용 장기 이용권 패키지',
    convenience: '야식·에너지드링크 시험 기간 특별 할인',
    chicken: '시험 종료 후 뒤풀이 쿠폰 선제 배포',
    karaoke: '합격 기원 노래방 할인 이벤트',
    fitness: '시험 후 스트레스 해소 무료 체험권',
    photo: '시험 후 프로필 사진 업데이트 이벤트',
    pcroom: '시험 후 여흥 할인 쿠폰',
    nail: '시험 후 자기 보상 네일 케어 쿠폰',
    buffet: '시험 종료 후 단체 회식 패키지',
  },
};

const eventOptions = [
  { value: 'festival' as EventType, label: '축제', emoji: '🎪', desc: '봄·가을 학교 축제' },
  { value: 'sports' as EventType, label: '체육대회', emoji: '⚽', desc: '단과대·학교 체육대회' },
  { value: 'mt' as EventType, label: 'MT', emoji: '🏕️', desc: '신입생·동아리 MT' },
  { value: 'exam' as EventType, label: '시험기간', emoji: '📝', desc: '중간·기말고사' },
];

const budgetOptions = [
  { value: 'small' as Budget, label: '10만원 이하', emoji: '💰', desc: '소규모 이벤트' },
  { value: 'medium' as Budget, label: '50만원', emoji: '💳', desc: '일반 행사' },
  { value: 'large' as Budget, label: '100만원+', emoji: '🏦', desc: '대규모 행사' },
];

const targetOptions = [
  { value: 'freshman' as Target, label: '신입생', emoji: '🌱', desc: '1학년 중심' },
  { value: 'student' as Target, label: '재학생', emoji: '🎓', desc: '2~4학년 중심' },
  { value: 'female' as Target, label: '여학생 多', emoji: '👩‍🎓', desc: '여학생 비율 60%+' },
];

const eventLabels: Record<EventType, string> = {
  festival: '축제',
  sports: '체육대회',
  mt: 'MT',
  exam: '시험기간',
};

const budgetLabels: Record<Budget, string> = {
  small: '10만원 이하',
  medium: '50만원',
  large: '100만원+',
};

const targetLabels: Record<Target, string> = {
  freshman: '신입생',
  student: '재학생',
  female: '여학생 多',
};

function calculateScores(
  eventType: EventType,
  budget: Budget,
  target: Target
): ScoreResult[] {
  return businesses
    .map((business) => {
      const base = business.baseScore;
      const eventBonus = eventWeights[eventType][business.id] ?? 0;
      const targetBonus = targetWeights[target][business.id] ?? 0;
      const budgetBonus = budgetWeights[budget][business.id] ?? 0;
      const total = base + eventBonus + targetBonus + budgetBonus;
      const strategy =
        strategies[eventType][business.id] ??
        `${eventLabels[eventType]} 기간 ${business.name} 제휴 할인 이벤트`;
      return { business, base, eventBonus, targetBonus, budgetBonus, total, strategy };
    })
    .sort((a, b) => b.total - a.total);
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.min(score, 100);
  const color =
    score >= 80 ? 'bg-orange-500' : score >= 65 ? 'bg-teal-500' : 'bg-gray-300';
  return (
    <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
      <div className={`${color} h-2 rounded-full`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function SelectCard<T extends string>({
  value,
  current,
  label,
  emoji,
  desc,
  onClick,
}: {
  value: T;
  current: T;
  label: string;
  emoji: string;
  desc: string;
  onClick: (v: T) => void;
}) {
  const selected = value === current;
  return (
    <button
      onClick={() => onClick(value)}
      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
        selected
          ? 'border-teal-500 bg-teal-50 text-teal-700'
          : 'border-gray-100 bg-white hover:border-teal-200 text-gray-700'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{emoji}</span>
        <span className="font-semibold text-sm">{label}</span>
      </div>
      <div className="text-xs text-gray-500 mt-0.5 ml-7">{desc}</div>
    </button>
  );
}

const medals = ['🥇', '🥈', '🥉'];

export default function Home() {
  const [eventType, setEventType] = useState<EventType>('festival');
  const [budget, setBudget] = useState<Budget>('medium');
  const [target, setTarget] = useState<Target>('student');
  const [results, setResults] = useState<ScoreResult[] | null>(null);
  const [showAll, setShowAll] = useState(false);

  const handleAnalyze = () => {
    setResults(calculateScores(eventType, budget, target));
    setShowAll(false);
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800 text-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-emerald-200 text-xs font-semibold mb-3 tracking-widest uppercase">
            Portfolio Project · 데이터 기반 의사결정 모델
          </div>
          <h1 className="text-4xl font-bold mb-3">🏫 Campus Partner Finder</h1>
          <p className="text-teal-100 text-base leading-relaxed max-w-2xl">
            학생회 대외협력국장으로{' '}
            <span className="font-bold text-white">100개 제휴처를 직접 발굴</span>한 경험을
            기반으로, 행사 유형·예산·타겟 특성에 따라 최적 제휴 업종과 마케팅 전략을
            추천합니다.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {['Next.js 16', 'TypeScript', 'Tailwind CSS v4', '의사결정 모델'].map((tag) => (
              <span
                key={tag}
                className="bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Input Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
          <h2 className="text-base font-bold text-gray-800 mb-5">행사 조건 입력</h2>
          <div className="grid md:grid-cols-3 gap-5">
            <div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                행사 유형
              </div>
              <div className="space-y-2">
                {eventOptions.map((opt) => (
                  <SelectCard
                    key={opt.value}
                    value={opt.value}
                    current={eventType}
                    label={opt.label}
                    emoji={opt.emoji}
                    desc={opt.desc}
                    onClick={setEventType}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                제휴 예산
              </div>
              <div className="space-y-2">
                {budgetOptions.map((opt) => (
                  <SelectCard
                    key={opt.value}
                    value={opt.value}
                    current={budget}
                    label={opt.label}
                    emoji={opt.emoji}
                    desc={opt.desc}
                    onClick={setBudget}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                타겟 대상
              </div>
              <div className="space-y-2">
                {targetOptions.map((opt) => (
                  <SelectCard
                    key={opt.value}
                    value={opt.value}
                    current={target}
                    label={opt.label}
                    emoji={opt.emoji}
                    desc={opt.desc}
                    onClick={setTarget}
                  />
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            className="mt-6 w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg text-base"
          >
            제휴처 적합도 분석하기 →
          </button>
        </div>

        {/* Score Model */}
        <div className="bg-teal-50 border border-teal-100 rounded-xl px-5 py-4 mb-6">
          <div className="text-sm font-bold text-teal-700 mb-1">📊 적합도 계산 모델</div>
          <code className="text-sm text-teal-600">
            적합도 = 기본점수 (38~50) + 행사 가중치 (0~25) + 타겟 가중치 (0~15) + 예산 적합도 (0~10)
          </code>
        </div>

        {/* Results */}
        {results && (
          <div>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <h2 className="text-lg font-bold text-gray-800">추천 제휴처</h2>
              {[eventLabels[eventType], budgetLabels[budget], targetLabels[target]].map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-teal-100 text-teal-700 font-semibold px-2 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Top 3 Cards */}
            <div className="space-y-4 mb-5">
              {results.slice(0, 3).map((result, idx) => (
                <div
                  key={result.business.id}
                  className={`bg-white rounded-2xl shadow-sm border p-6 ${
                    idx === 0 ? 'border-yellow-300' : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{medals[idx]}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{result.business.emoji}</span>
                          <span className="text-xl font-bold text-gray-800">
                            {result.business.name}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">#{idx + 1} 추천</div>
                      </div>
                    </div>
                    <div className="text-right min-w-16">
                      <div
                        className={`text-3xl font-bold ${
                          result.total >= 80
                            ? 'text-orange-500'
                            : result.total >= 65
                            ? 'text-teal-600'
                            : 'text-gray-600'
                        }`}
                      >
                        {result.total}점
                      </div>
                      <ScoreBar score={result.total} />
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
                      점수 계산 과정
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="bg-white rounded-lg p-2">
                        <div className="text-lg font-bold text-gray-700">+{result.base}</div>
                        <div className="text-xs text-gray-400">기본점수</div>
                      </div>
                      <div className="bg-white rounded-lg p-2">
                        <div
                          className={`text-lg font-bold ${
                            result.eventBonus > 0 ? 'text-teal-600' : 'text-gray-300'
                          }`}
                        >
                          +{result.eventBonus}
                        </div>
                        <div className="text-xs text-gray-400">행사 가중치</div>
                      </div>
                      <div className="bg-white rounded-lg p-2">
                        <div
                          className={`text-lg font-bold ${
                            result.targetBonus > 0 ? 'text-purple-600' : 'text-gray-300'
                          }`}
                        >
                          +{result.targetBonus}
                        </div>
                        <div className="text-xs text-gray-400">타겟 가중치</div>
                      </div>
                      <div className="bg-white rounded-lg p-2">
                        <div
                          className={`text-lg font-bold ${
                            result.budgetBonus > 0 ? 'text-emerald-600' : 'text-gray-300'
                          }`}
                        >
                          +{result.budgetBonus}
                        </div>
                        <div className="text-xs text-gray-400">예산 적합도</div>
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-gray-200 text-center text-sm text-gray-500">
                      {result.base} + {result.eventBonus} + {result.targetBonus} +{' '}
                      {result.budgetBonus} ={' '}
                      <span className="font-bold text-gray-800">{result.total}점</span>
                    </div>
                  </div>

                  {/* Strategy */}
                  <div className="flex items-start gap-2">
                    <span className="text-orange-500 font-bold mt-0.5">→</span>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold text-gray-700">추천 전략: </span>
                      {result.strategy}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* All Results Table */}
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full py-3 border-2 border-gray-200 rounded-xl text-gray-500 font-medium hover:border-teal-300 hover:text-teal-600 transition-all mb-4 text-sm"
            >
              {showAll
                ? '▲ 접기'
                : `▼ 전체 ${results.length}개 업종 분석 결과 보기`}
            </button>

            {showAll && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-4 py-3 text-gray-500 font-semibold text-xs">순위</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-semibold text-xs">업종</th>
                      <th className="text-center px-3 py-3 text-gray-500 font-semibold text-xs">기본</th>
                      <th className="text-center px-3 py-3 text-teal-500 font-semibold text-xs">행사</th>
                      <th className="text-center px-3 py-3 text-purple-500 font-semibold text-xs">타겟</th>
                      <th className="text-center px-3 py-3 text-emerald-500 font-semibold text-xs">예산</th>
                      <th className="text-center px-3 py-3 text-gray-700 font-semibold text-xs">합계</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, idx) => (
                      <tr
                        key={result.business.id}
                        className={`border-b border-gray-50 ${
                          idx < 3 ? 'bg-teal-50/40' : ''
                        }`}
                      >
                        <td className="px-4 py-3 text-gray-500 font-medium text-sm">
                          {idx < 3 ? medals[idx] : `#${idx + 1}`}
                        </td>
                        <td className="px-4 py-3">
                          <span className="mr-1">{result.business.emoji}</span>
                          <span className="font-medium text-gray-800">{result.business.name}</span>
                        </td>
                        <td className="px-3 py-3 text-center text-gray-600">{result.base}</td>
                        <td className="px-3 py-3 text-center text-teal-600 font-medium">
                          {result.eventBonus > 0 ? `+${result.eventBonus}` : '—'}
                        </td>
                        <td className="px-3 py-3 text-center text-purple-600 font-medium">
                          {result.targetBonus > 0 ? `+${result.targetBonus}` : '—'}
                        </td>
                        <td className="px-3 py-3 text-center text-emerald-600 font-medium">
                          {result.budgetBonus > 0 ? `+${result.budgetBonus}` : '—'}
                        </td>
                        <td className="px-3 py-3 text-center font-bold text-gray-800">
                          {result.total}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400">
            함다연 포트폴리오 · 학생회 대외협력국장 100개 제휴처 발굴 경험 기반
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Campus Partner Finder · Built with Next.js + TypeScript + Tailwind CSS
          </p>
        </div>
      </div>
    </main>
  );
}
