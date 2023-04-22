import {
    createDisclosure,
    Modal,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Button,
} from '@hope-ui/solid';
import { createEffect } from 'solid-js';
import { useUnit } from 'effector-solid/scope';
import { openItemsModel } from 'features/open-items';
import { gameModel } from 'entities/game';

export const LoserModal = () => {
    const { isOpen, onOpen, onClose } = createDisclosure();

    const [isGameOver, genNewGame] = useUnit([
        openItemsModel.$isGameOver,
        gameModel.genNewGame,
    ]);

    createEffect(() => {
        console.log(isGameOver(), 'isGameOver()');
    });

    createEffect(() => {
        if (isGameOver()) {
            onOpen();
        }
    });

    const newGame = () => {
        onClose();
        genNewGame(null);
    };

    return (
        <Modal centered opened={isOpen()} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalCloseButton />
                <ModalHeader>
                    <p>К сожалению ты проиграла.</p>
                    <p>Попробуй еще раз!</p>
                </ModalHeader>

                <ModalFooter>
                    <Button onClick={newGame}>Начать новую игру</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
