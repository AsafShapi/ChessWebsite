import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog"
  import { Button } from "@/components/ui/button"
  
  export function RematchDialog({ 
    open, 
    onOpenChange, 
    winner,
    gameEndReason,
    onAccept, 
    onDecline,
    rematchStatus 
  }) {
    const getGameEndReason = () => {
      switch (gameEndReason) {
        case 'checkmate': return "Victory by checkmate";
        case 'resign': return "Victory by resignation";
        case 'insufficient': return "Draw by insufficient material";
        case 'stalemate': return "Draw by stalemate";
        case 'threefold': return "Draw by threefold repetition";
        case 'fifty-moves': return "Draw by fifty-move rule";
        default: return "";
      }
    };
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Game Over!</DialogTitle>
            <DialogDescription>
              {winner ? `${winner} has won the game!` : "The game is over!"} - {getGameEndReason()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {rematchStatus ? (
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  {rematchStatus === 'pending' ? (
                    'Waiting for opponent to accept rematch...'
                  ) : rematchStatus === 'received' ? (
                    'Opponent wants to play again!'
                  ) : (
                    'Starting new game...'
                  )}
                </p>
                {rematchStatus === 'received' && (
                  <div className="flex gap-2 justify-center">
                    <Button onClick={onAccept} variant="default">
                      Accept
                    </Button>
                    <Button onClick={onDecline} variant="outline">
                      Decline
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-2 justify-center">
                <Button onClick={onAccept}>
                  Request Rematch
                </Button>
                <Button onClick={onDecline} variant="outline">
                  Leave Game
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    )
  }
  
  