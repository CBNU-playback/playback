import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import {
  ExpandMore,
  CloudUpload,
  VideoLibrary,
  Edit,
  Save,
  Download,
  Help as HelpIcon,
  ArrowBack,
} from '@mui/icons-material';

export default function Help() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Header */}
      <AppBar position="sticky" color="transparent" elevation={0} sx={{ borderBottom: '1px solid #eef2f7', backdropFilter: 'saturate(180%) blur(4px)', bgcolor: '#ffffff' }}>
        <Toolbar>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            AI Sports Editor - Help
          </Typography>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/')} sx={{ bgcolor: '#111827', color: '#fff', '&:hover': { bgcolor: '#0b1220' } }}>
            돌아가기
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* 소개 -->
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <HelpIcon sx={{ fontSize: 60, color: '#1976d2', mb: 2 }} />
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
            플레이백 사용 가이드
          </Typography>
          <Typography variant="h6" color="text.secondary">
            AI 기반 스포츠 하이라이트 편집기 사용법을 안내합니다
          </Typography>
        </Box>

        {/* 빠른 시작 가이드 */}
        <Card sx={{ mb: 4, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              ⚡ 빠른 시작 가이드
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box sx={{ minWidth: 40, height: 40, borderRadius: '50%', bgcolor: '#1976d2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>1</Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>영상 업로드</Typography>
                  <Typography>Home 페이지에서 축구 경기 영상(MP4, MKV)을 드래그 앤 드롭하거나 업로드 버튼을 클릭합니다.</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box sx={{ minWidth: 40, height: 40, borderRadius: '50%', bgcolor: '#1976d2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>2</Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>AI 자동 분석 대기</Typography>
                  <Typography>시스템이 자동으로 리플레이 로고를 탐지하고, 자막을 생성하며, 이벤트를 분류합니다.</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box sx={{ minWidth: 40, height: 40, borderRadius: '50%', bgcolor: '#1976d2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>3</Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>하이라이트 선택 & 편집</Typography>
                  <Typography>Editor 페이지에서 원하는 하이라이트를 선택하거나 커스텀 하이라이트를 추가합니다.</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box sx={{ minWidth: 40, height: 40, borderRadius: '50%', bgcolor: '#1976d2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>4</Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>내보내기</Typography>
                  <Typography>편집 옵션을 설정하고 'Export Selected Highlights' 버튼을 클릭해 최종 영상을 다운로드합니다.</Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* 상세 기능 설명 (Accordion) */}
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          📖 기능별 상세 가이드
        </Typography>

        {/* 1. 영상 업로드 */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: '#f9fafb' }}>
            <CloudUpload sx={{ mr: 2, color: '#1976d2' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>1. 영상 업로드</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography paragraph>
              <strong>업로드 방법:</strong>
            </Typography>
            <ul>
              <li><strong>드래그 앤 드롭:</strong> 업로드 영역에 영상 파일을 끌어다 놓기</li>
              <li><strong>버튼 클릭:</strong> 'Upload Video' 버튼 클릭 후 파일 선택</li>
            </ul>
            <Typography paragraph sx={{ mt: 2 }}>
              <strong>지원 형식:</strong> MP4, MKV
            </Typography>
            <Typography paragraph>
              <strong>파일 크기:</strong> 최대 10GB (권장 2GB 이하, 처리 시간 약 5~10분)
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="error" paragraph>
              ⚠️ 예외 상황:
            </Typography>
            <ul>
              <li>지원하지 않는 형식: "MP4, MKV만 업로드 가능합니다." 메시지 표시</li>
              <li>중복 영상: 기존 분석 결과를 자동으로 불러옵니다</li>
              <li>네트워크 오류: "업로드 실패. 네트워크 연결을 확인하세요." 표시</li>
            </ul>
          </AccordionDetails>
        </Accordion>

        {/* 2. 비디오 플레이어 */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: '#f9fafb' }}>
            <VideoLibrary sx={{ mr: 2, color: '#1976d2' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>2. 비디오 플레이어</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography paragraph>
              <strong>재생 컨트롤:</strong>
            </Typography>
            <ul>
              <li><strong>재생/일시정지:</strong> ▶/❚❚ 버튼 클릭 또는 스페이스바</li>
              <li><strong>10초 이동:</strong> ⏮/⏭ 버튼 또는 키보드 ←/→ 화살표</li>
              <li><strong>구간 탐색:</strong> 타임라인 슬라이더 드래그</li>
              <li><strong>볼륨 조절:</strong> 우측 볼륨 슬라이더 조작</li>
            </ul>
            <Typography paragraph sx={{ mt: 2 }}>
              <strong>현재 시간 표시:</strong> MM:SS / MM:SS 형식
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* 3. 타임라인 & 하이라이트 */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: '#f9fafb' }}>
            <Edit sx={{ mr: 2, color: '#1976d2' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>3. 타임라인 & 하이라이트</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography paragraph>
              <strong>타임라인 색상 범례:</strong>
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 20, height: 20, bgcolor: '#e53935', borderRadius: 1 }} />
                <Typography variant="body2">Goal</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 20, height: 20, bgcolor: '#1976d2', borderRadius: 1 }} />
                <Typography variant="body2">Shoot</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 20, height: 20, bgcolor: '#43a047', borderRadius: 1 }} />
                <Typography variant="body2">Save</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 20, height: 20, bgcolor: '#8e24aa', borderRadius: 1 }} />
                <Typography variant="body2">Foul</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 20, height: 20, bgcolor: '#ff9800', borderRadius: 1 }} />
                <Typography variant="body2">Corner</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 20, height: 20, bgcolor: '#808080', borderRadius: 1 }} />
                <Typography variant="body2">Custom</Typography>
              </Box>
            </Box>
            <Typography paragraph>
              <strong>하이라이트 조작:</strong>
            </Typography>
            <ul>
              <li><strong>선택/해제:</strong> 체크박스 클릭</li>
              <li><strong>재생:</strong> ▶ 버튼으로 해당 구간 바로 재생</li>
              <li><strong>삭제:</strong> 🗑️ 버튼으로 하이라이트 제거 (저장 필요)</li>
              <li><strong>카테고리 필터:</strong> 상단 탭으로 이벤트 유형별 보기</li>
              <li><strong>페이지네이션:</strong> 한 페이지에 4개씩 표시, &lt;/&gt; 버튼으로 이동</li>
            </ul>
          </AccordionDetails>
        </Accordion>

        {/* 4. 커스텀 하이라이트 추가 */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: '#f9fafb' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', ml: 5 }}>4. 커스텀 하이라이트 추가</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography paragraph>
              <strong>AI가 놓친 장면을 수동으로 추가하는 방법:</strong>
            </Typography>
            <ol>
              <li>'Add Custom Highlight' 버튼 클릭</li>
              <li>모달 창에서 하이라이트 이름 입력 (선택사항)</li>
              <li>시작 시간 입력 (HH:MM:SS 형식)
                <ul>
                  <li>예: 00:15:30 (15분 30초)</li>
                </ul>
              </li>
              <li>종료 시간 입력 (HH:MM:SS 형식)</li>
              <li>'Add' 버튼 클릭</li>
            </ol>
            <Typography paragraph sx={{ mt: 2 }}>
              <strong>주의사항:</strong>
            </Typography>
            <ul>
              <li>시작 시간은 반드시 종료 시간보다 작아야 합니다</li>
              <li>시간 범위는 영상 길이를 초과할 수 없습니다</li>
              <li>추가 후 반드시 'Save' 버튼을 눌러 저장하세요</li>
            </ul>
          </AccordionDetails>
        </Accordion>

        {/* 5. 편집 옵션 */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: '#f9fafb' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', ml: 5 }}>5. 편집 옵션 설정</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography paragraph>
              <strong>내보내기 전 설정할 수 있는 옵션:</strong>
            </Typography>
            <Box sx={{ ml: 2 }}>
              <Typography paragraph>
                <strong>📝 Text Overlay (텍스트 오버레이):</strong>
              </Typography>
              <ul>
                <li>ON: 각 하이라이트 구간 하단에 이벤트 타입 표시 (예: "Goal", "Shoot")</li>
                <li>OFF: 텍스트 없이 영상만 표시</li>
              </ul>
              
              <Typography paragraph sx={{ mt: 2 }}>
                <strong>🎬 Fade Transition (페이드 전환 효과):</strong>
              </Typography>
              <ul>
                <li>ON: 각 하이라이트 앞에 1.5초 검은 화면 + 중앙 큰 텍스트로 이벤트 안내</li>
                <li>OFF: 하이라이트만 바로 이어붙임</li>
              </ul>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* 6. 저장 & 내보내기 */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: '#f9fafb' }}>
            <Save sx={{ mr: 2, color: '#1976d2' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>6. 저장 & 내보내기</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography paragraph>
              <strong>💾 편집 저장 (Save):</strong>
            </Typography>
            <ul>
              <li>선택/삭제/추가한 하이라이트를 DB와 파일시스템에 저장</li>
              <li>변경사항이 있으면 "저장되지 않음" 표시</li>
              <li>페이지 이탈 시 경고 메시지 표시</li>
              <li>저장 완료 후 "저장 완료!" 메시지 2초간 표시</li>
            </ul>
            
            <Typography paragraph sx={{ mt: 2 }}>
              <strong>📥 하이라이트 내보내기 (Export):</strong>
            </Typography>
            <ol>
              <li>1개 이상의 하이라이트 선택 (체크박스)</li>
              <li>편집 옵션 설정 (텍스트 오버레이, 페이드 전환)</li>
              <li>'Export Selected Highlights' 버튼 클릭</li>
              <li>"영상 편집 중입니다..." 메시지 대기</li>
              <li>브라우저 다운로드 다이얼로그에서 저장 위치 선택</li>
              <li>파일명: <code>{`{원본명}_edited_highlights.mp4`}</code></li>
            </ol>
            
            <Typography variant="subtitle2" color="error" paragraph sx={{ mt: 2 }}>
              ⚠️ 주의: 하이라이트 미선택 시 "Please select at least one highlight" 경고
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* 7. AI 분석 과정 */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: '#f9fafb' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', ml: 5 }}>7. AI 자동 분석 과정 이해하기</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography paragraph>
              <strong>3단계 AI 파이프라인:</strong>
            </Typography>
            <Box sx={{ ml: 2 }}>
              <Typography paragraph>
                <strong>1️⃣ 로고 탐지 & 타임라인 생성:</strong>
              </Typography>
              <ul>
                <li>OpenCV로 리플레이 로고 자동 탐지</li>
                <li>인접 프레임 병합하여 하이라이트 후보 타임라인 생성</li>
                <li>처리 시간: 약 2~3분</li>
              </ul>
              
              <Typography paragraph sx={{ mt: 2 }}>
                <strong>2️⃣ 음성 → 자막 변환 (STT):</strong>
              </Typography>
              <ul>
                <li>FFmpeg로 오디오 추출</li>
                <li>Whisper 모델로 해설 음성을 텍스트로 변환</li>
                <li>SRT, JSON 형식으로 저장 (영문 번역 포함)</li>
                <li>처리 시간: 약 3~5분</li>
              </ul>
              
              <Typography paragraph sx={{ mt: 2 }}>
                <strong>3️⃣ 자막 → 이벤트 분류 (BERT 앙상블):</strong>
              </Typography>
              <ul>
                <li>자막 텍스트를 BERT 모델 2개로 분석</li>
                <li>소프트보팅으로 최종 이벤트 유형 결정 (Goal, Shoot, Foul, Save 등)</li>
                <li>각 타임라인에 이벤트 타입 매핑</li>
                <li>처리 시간: 약 1~2분</li>
              </ul>
            </Box>
            <Typography paragraph sx={{ mt: 2, bgcolor: '#e3f2fd', p: 2, borderRadius: 2 }}>
              💡 <strong>Tip:</strong> 중복된 영상을 다시 업로드하면 캐시된 결과를 즉시 불러와 대기 시간이 없습니다!
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* 8. FAQ */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: '#f9fafb' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', ml: 5 }}>8. 자주 묻는 질문 (FAQ)</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Q1. 하이라이트가 하나도 탐지되지 않았어요.</Typography>
                <Typography>A1. 리플레이 로고가 없는 영상이거나 탐지 실패 시 발생합니다. 'Add Custom Highlight'로 수동 추가하세요.</Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Q2. 이벤트 분류가 잘못되었어요.</Typography>
                <Typography>A2. AI 정확도는 90% 이상이지만 오분류가 있을 수 있습니다. 잘못된 하이라이트는 삭제하고 커스텀으로 추가하세요.</Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Q3. 저장하지 않고 페이지를 나가면 어떻게 되나요?</Typography>
                <Typography>A3. 변경사항이 있으면 경고 메시지가 표시됩니다. 반드시 'Save' 버튼을 눌러 저장하세요.</Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Q4. 내보내기가 실패했어요.</Typography>
                <Typography>A4. 네트워크 상태를 확인하고 재시도하세요. 구간이 너무 많으면 시간이 오래 걸릴 수 있습니다 (최대 10분).</Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Q5. 지원하는 브라우저는 무엇인가요?</Typography>
                <Typography>A5. Chrome 브라우저를 권장합니다. Edge, Firefox도 사용 가능하지만 일부 기능이 제한될 수 있습니다.</Typography>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* 9. 시스템 요구사항 */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: '#f9fafb' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', ml: 5 }}>9. 시스템 요구사항</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography paragraph>
              <strong>권장 환경:</strong>
            </Typography>
            <ul>
              <li><strong>브라우저:</strong> Chrome (최신 버전)</li>
              <li><strong>네트워크:</strong> 안정적인 인터넷 연결 (업로드/다운로드 대역폭)</li>
              <li><strong>화면 해상도:</strong> 1920x1080 이상 권장</li>
            </ul>
            <Typography paragraph sx={{ mt: 2 }}>
              <strong>영상 파일 요구사항:</strong>
            </Typography>
            <ul>
              <li><strong>형식:</strong> MP4, MKV</li>
              <li><strong>코덱:</strong> H.264 (권장)</li>
              <li><strong>해상도:</strong> 720p 이상</li>
              <li><strong>길이:</strong> 10분~120분 권장</li>
            </ul>
          </AccordionDetails>
        </Accordion>

        {/* Contact */}
        <Box sx={{ mt: 6, p: 4, bgcolor: '#ffffff', borderRadius: 2, boxShadow: 2, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            추가 도움이 필요하신가요?
          </Typography>
          <Typography color="text.secondary" paragraph>
            충북대학교 소프트웨어학과 졸업작품 - 플레이백팀
          </Typography>
          <Typography variant="body2" color="text.secondary">
            팀원: 김동원, 이동규, 배기원 | 지도교수: 최경주 교수님
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

