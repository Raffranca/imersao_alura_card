import { Box, Text, TextField, Image, Button } from '@skynexui/components';
import React from 'react';
import appConfig from '../config.json';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js'
import { ButtonSendSticker } from '../src/componets/ButtonSendSticker';

const SUPABASE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0Mzg0NjUwOSwiZXhwIjoxOTU5NDIyNTA5fQ.r_mnzl29WHIxk8wwzEdCOgw8JMnfbreBPQ2jErBPItA';
const URL = 'https://vscvlmbrjexmchydgedb.supabase.co';
const SUPAclient = createClient(URL, SUPABASE);

function escutaMensagensEmTempoReal(adicionaMensagem) {
    return SUPAclient
        .from('mensagens')
        .on('INSERT', (respostaLive) => {
            adicionaMensagem(respostaLive.new);
        })
        .subscribe();
}


export default function ChatPage() {
    // Sua lógica vai aqui
    const router = useRouter();
    const usuarioLogado = router.query.username;
    const [mensagem, setMensagem] = React.useState('');
    const [listaDeMensagens, setListaDeMensagens] = React.useState([]);
    
    React.useEffect(()=>{
        SUPAclient
            .from('mensagens card')
            .select('*')
            .order('id', {ascending: false})
            .then(({data})=>{
                //console.log(data);
                setListaDeMensagens(data);
            });
    

    const subscription = escutaMensagensEmTempoReal((novaMensagem) => {
        console.log('Nova mensagem:', novaMensagem);
        console.log('listaDeMensagens:', listaDeMensagens);
        // Quero reusar um valor de referencia (objeto/array) 
        // Passar uma função pro setState

        // setListaDeMensagens([
        //     novaMensagem,
        //     ...listaDeMensagens
        // ])
        setListaDeMensagens((valorAtualDaLista) => {
            console.log('valorAtualDaLista:', valorAtualDaLista);
            return [
                novaMensagem,
                ...valorAtualDaLista,
            ]
        });
    });

        return () => {
            subscription.unsubscribe();
        } 
    }, []);

    function handleNovaMensagem(novaMensagem){
        const mensagem = {
            //id: listaDeMensagens.length + 1,
            de: usuarioLogado,
            texto: novaMensagem,
        }

        SUPAclient
            .from('mensagens')
            .insert([
                mensagem
            ])
            .then(({data})=>{
                /*setListaDeMensagens([
                    data[0],
                    ...listaDeMensagens,
                ]);*/
            })

        setMensagem('');
    }

    // ./Sua lógica vai aqui
    return (
        <Box
            styleSheet={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                //backgroundColor: appConfig.theme.colors.primary[500],
                backgroundImage: `url(https://i0.wp.com/oquartonerd.com.br/wp-content/uploads/2020/02/mulher-maravilha-1984-filme-ganha-primeiro-teaser-e-anuncia-trailer_f.jpg?w=1200&ssl=1)`,
                backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundBlendMode: 'multiply',
                color: appConfig.theme.colors.neutrals['000']
            }}
        >
            <Box
                styleSheet={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    boxShadow: '0 2px 10px 0 rgb(0 0 0 / 20%)',
                    borderRadius: '5px',
                    backgroundColor: appConfig.theme.colors.neutrals[350],
                    height: '100%',
                    maxWidth: '95%',
                    maxHeight: '95vh',
                    padding: '32px',
                }}
            >
                <Header />
                <Box
                    styleSheet={{
                        position: 'relative',
                        display: 'flex',
                        flex: 1,
                        height: '80%',
                        //backgroundColor: appConfig.theme.colors.neutrals[350],
                        flexDirection: 'column',
                        borderRadius: '5px',
                        padding: '16px',
                    }}
                >

                    <MessageList mensagens={listaDeMensagens} /> 
                    

                    <Box
                        as="form"
                        styleSheet={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <TextField
                            value={mensagem}
                            onChange={(event)=>{
                                const valor = event.target.value;
                                setMensagem(valor);
                            }}
                            onKeyPress={(event)=>{
                                if(event.key === 'Enter'){
                                    event.preventDefault();
                                    handleNovaMensagem(mensagem);

                                }
                            }}
                            placeholder="Insira sua mensagem aqui..."
                            type="textarea"
                            styleSheet={{
                                width: '100%',
                                border: '0',
                                resize: 'none',
                                borderRadius: '5px',
                                padding: '6px 8px',
                                backgroundColor: appConfig.theme.colors.neutrals[800],
                                marginRight: '12px',
                                color: appConfig.theme.colors.neutrals[200],
                            }}
                        />
                        <ButtonSendSticker
                            onStickerClick={(sticker) => {
                // console.log('[USANDO O COMPONENTE] Salva esse sticker no banco', sticker);
                            handleNovaMensagem(':sticker: ' + sticker);
                            }}
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

function Header() {
    return (
        <>
            <Box styleSheet={{ width: '100%', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
                <Text variant='heading5'>
                    Chat
                </Text>
                <Button
                    variant='tertiary'
                    colorVariant='neutral'
                    label='Logout'
                    href="/"
                />
            </Box>
        </>
    )
}

function MessageList(props) {
    console.log('MessageList', props);
    return (
        <Box
            tag="ul"
            styleSheet={{
                overflow: 'scroll',
                display: 'flex',
                flexDirection: 'column-reverse',
                flex: 1,
                color: appConfig.theme.colors.neutrals["000"],
                marginBottom: '16px',
            }}
        >
            {props.mensagens.map((mensagem)=>{
                return(
                    <Text
                    key={mensagem.id}
                    tag="li"
                    styleSheet={{
                        borderRadius: '5px',
                        padding: '6px',
                        marginBottom: '12px',
                        hover: {
                            backgroundColor: appConfig.theme.colors.neutrals[700],
                        }
                    }}
                >
                    <Box
                        styleSheet={{
                            marginBottom: '8px',
                        }}
                    >
                        <Image
                            styleSheet={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                display: 'inline-block',
                                marginRight: '8px',
                            }}
                            src={`https://github.com/${mensagem.de}.png`}
                        />
                        <Text tag="strong">
                            {mensagem.de}
                        </Text>
                        <Text
                            styleSheet={{
                                fontSize: '10px',
                                marginLeft: '8px',
                                color: appConfig.theme.colors.neutrals[300],
                            }}
                            tag="span"
                        >
                            {(new Date().toLocaleDateString())}
                        </Text>
                    </Box>
                    {mensagem.texto.startsWith(':sticker:')
                        ? (
                            <Image src={mensagem.texto.replace(':sticker:', '')} />
                        )
                        : (
                mensagem.texto
                )}
                </Text>
                );
            })}
        </Box>
    )
} 