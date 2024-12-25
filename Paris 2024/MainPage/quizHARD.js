const questions = [
    {
        question: "Qual é a distância oficial da maratona que foi realizada nesta última edição?",
        options: ["40 km", "42,195 km", "45 km", "50 km"],
        correct: 1
    },
    {
        question: "Qual será a nova forma inovadora da cerimónia de abertura",
        options: ["Acontecerá no Stade de France (aka estádio que o éder os estragou)", "Foi realizada ao longo do Rio Sena", "Será apenas virtual", "Acontecerá simultaneamente em dois locais"],
        correct: 1
    },
    {
        question: "Quais os desportos que sera realizados fora da França continentam durante os Jogos Olímpicos de Paris 2024?",
        options: ["Surf", "Atletismo", "Natação", "Escalada"],
        correct: 0
    },
    {
        question: "Qual é a meta de neutralidade das emissões de carbono para os Jogos Olímpicos de Paris 2024?",
        options: ["Reduzir em 30% as emissões em comparação com edições anteriores", "Eliminar todas as emissões", "Compensar apenas 50% das emissões", "Não há meta"],
        correct: 0
    },
    {
        question: "Quais tecnologias serão usadas para tornar os Jogos Olímpicos de Paris mais sustentáveis?",
        options: ["Energia nuclear", "Energia solar e transporte elétrico", "Construções temporárias com concreto", "Energia a diesel"],
        correct: 1
    },
    {
        question: "Qual é o nome do comié responsável pela organização dos Jogos Olímpicos de Paris? ",
        options: ["COI", "COP24", "Paris 2024", "Comité Olímpico Frances"],
        correct: 2
    },
    {
        question: "Como o design das medalhas de Paris 2024 reflete a herança cultural da França?",
        options: ["Inclui símbolos da Revolução Francesa", "É feito de ouro puro", "É decorado com imagens de atletas", "Usa apenas o logotipo olímpico"],
        correct: 0
    },
    {
        question: "Qual foi o processo de seleção para as modalidades adicionais nos Jogos Olímpicos de Paris 2024?",
        options: ["Votação pública", "Escolha do COI com recomendação do comité organizador", "Escolha por patrocionadores", "Decisão dos atletas"],
        correct: 1
    },
    {
        question: "Quantas cidades francesas participarão como anfitriãs dos Jogos Olímpicos de Paris 2024?",
        options: ["10", "15", "20", "5"],
        correct: 1
    },
    {
        question: "Qual será o maior local de competição dos Jogos Olímpicos de Paris 2024?",
        options: ["Stade de France", "Torre Eiffel", "Arena de Lyon", "Palácio de Versalhes"],
        correct: 0
    }
];

function loadQuiz() {
    const quizContainer = document.getElementById('quiz');
    questions.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.id = `question-${index}`; 
        questionDiv.classList.add('mb-4');

        const questionText = document.createElement('h5');
        questionText.innerText = `${index + 1}. ${q.question}`;
        questionDiv.appendChild(questionText);

        q.options.forEach((option, i) => {
            const optionDiv = document.createElement('div');
            optionDiv.classList.add('form-check');

            const input = document.createElement('input');
            input.type = 'radio';
            input.name = `question-${index}`;
            input.value = i;
            input.classList.add('form-check-input');
            optionDiv.appendChild(input);

            const label = document.createElement('label');
            label.innerText = option;
            label.classList.add('form-check-label');
            optionDiv.appendChild(label);

            questionDiv.appendChild(optionDiv);
        });

        quizContainer.appendChild(questionDiv);
    });
}

function submitQuiz() {
    let score = 0;
    questions.forEach((q, index) => {
        const questionDiv = document.getElementById(`question-${index}`);
        const selected = document.querySelector(`input[name="question-${index}"]:checked`);
        const feedbackDiv = document.createElement('div');
        feedbackDiv.classList.add('mt-2', 'p-2');

        if (selected) {
            if (parseInt(selected.value) === q.correct) {
                score++;
                feedbackDiv.classList.add('correct');
                feedbackDiv.innerText = "Resposta correta!";
            } else {
                feedbackDiv.classList.add('incorrect');
                feedbackDiv.innerText = `Resposta errada. A resposta correta é: ${q.options[q.correct]}`;
            }
        } else {
            feedbackDiv.classList.add('incorrect');
            feedbackDiv.innerText = `Você não respondeu esta pergunta. A resposta correta é: ${q.options[q.correct]}`;
        }

        questionDiv.appendChild(feedbackDiv); // Adiciona feedback dentro da questão correspondente
        document.querySelectorAll(`input[name="question-${index}"]`).forEach(input => {
            input.disabled = true;
        });
    });

    const resultContainer = document.getElementById('result');
    resultContainer.innerHTML = `<h4>Você acertou ${score} de ${questions.length} perguntas!</h4>`;
}

window.onload = loadQuiz;