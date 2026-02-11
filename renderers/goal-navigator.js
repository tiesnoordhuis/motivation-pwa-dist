export class GoalNavigator {
    goalList;
    goalHeader;
    _currentParentId = null;
    _allGoals = [];
    constructor() {
        this.goalList = document.getElementById('goals-list');
        this.goalHeader = document.getElementById('goal-header');
    }
    get currentParentId() {
        return this._currentParentId;
    }
    get allGoals() {
        return this._allGoals;
    }
    renderGoals(goals) {
        this._allGoals = goals;
        this.renderCurrentView();
    }
    renderCurrentView() {
        let currentGoal;
        let goalsToShow = this._allGoals;
        if (this._currentParentId) {
            currentGoal = this.findGoal(this._allGoals, this._currentParentId);
            if (currentGoal) {
                goalsToShow = currentGoal.sub_goals ?? [];
            }
            else {
                // Parent deleted or lost
                this._currentParentId = null;
                goalsToShow = this._allGoals;
            }
        }
        // Update header card
        if (this.goalHeader) {
            if (currentGoal) {
                this.goalHeader.dataset.goalId = currentGoal.id;
                this.goalHeader.dataset.title = currentGoal.title;
                this.goalHeader.dataset.description = currentGoal.description ?? '';
            }
            else {
                delete this.goalHeader.dataset.goalId;
                delete this.goalHeader.dataset.title;
                delete this.goalHeader.dataset.description;
            }
        }
        // Update goal list
        if (this.goalList) {
            this.goalList.goals = goalsToShow;
        }
    }
    findGoal(nodes, id) {
        for (const node of nodes) {
            if (node.id === id)
                return node;
            if (node.sub_goals) {
                const found = this.findGoal(node.sub_goals, id);
                if (found)
                    return found;
            }
        }
        return undefined;
    }
    findParentNode(nodes, targetId) {
        for (const node of nodes) {
            if (node.sub_goals?.some(child => child.id === targetId)) {
                return node;
            }
            if (node.sub_goals) {
                const found = this.findParentNode(node.sub_goals, targetId);
                if (found)
                    return found;
            }
        }
        return null;
    }
    navigateTo(id) {
        this._currentParentId = id;
        document.documentElement.classList.remove('back-transition');
        this.updateViewWithTransition();
    }
    navigateUp() {
        if (!this._currentParentId)
            return;
        const parent = this.findParentNode(this._allGoals, this._currentParentId);
        this._currentParentId = parent ? parent.id : null;
        document.documentElement.classList.add('back-transition');
        this.updateViewWithTransition();
    }
    updateViewWithTransition() {
        if (document.startViewTransition) {
            document.startViewTransition(() => this.renderCurrentView());
        }
        else {
            this.renderCurrentView();
        }
    }
}
